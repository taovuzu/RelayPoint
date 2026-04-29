import prisma from '#db/index.db.js';
import { produceMessage } from '#util/kafka.js';
import { TOPICS } from '#config/kafka.config.js';
import logger from '#util/logger.js';
import { isAlreadyProcessed } from '#features/worker/idempotency.service.js';
import { healConnectionTokens, getNangoConnectionId } from '#features/connection/connection.service.js';
import { withAuthRetry } from '#util/retry.js';
import { interpolate } from '#util/interpolation.js';
import { storeFailed } from '#features/dlq/dlq.service.js';
import { buildExecutionContext } from '#util/execution-context.js';
import { ACTION_TYPES, RUN_STATUS } from '#constant.js';
import { findActionByKey } from '#apps/app-loader.js';
import { createGlobalVariable } from '#apps/global-variable.js';


export const executeAction = async (actionEvent) => {
  const { relayRunId, relayId, userId, action, stageIndex, triggerData } = actionEvent;

  const isProcessed = await isAlreadyProcessed(relayRunId, stageIndex);
  if (isProcessed) {
    logger.info('Worker: Skipping duplicate or already processed action', { relayRunId, stageIndex });
    return;
  }

  const healAuthCallback = async () => healConnectionTokens(userId, action.config.service);
  const stepStartedAt = Date.now();

  try {
    const stepResult = await withAuthRetry(async () => {
      const relayRun = await prisma.relayRun.findUnique({
        where: { id: relayRunId },
        select: { executionHistory: true, triggerMetadata: true }
      });

      const executionContext = buildExecutionContext(
        triggerData,
        relayRun?.executionHistory || []
      );

      const interpolatedConfig = interpolate(action.config, executionContext);

      logger.info('Worker: Executing action', {
        relayRunId,
        actionId: action.id,
        stage: stageIndex,
        service: action.config.service
      });

      const { app, action: actionDef } = findActionByKey(action.id);
      if (!actionDef) throw new Error(`Unknown action: ${action.id}`);

      const $ = await createGlobalVariable({
        app,
        userId,
        stepParameters: interpolatedConfig,
        executionContext,
      });

      await actionDef.run($);
      return $.actionOutput.data?.raw ?? $.actionOutput.data;

    }, healAuthCallback);

    const stepDuration = Date.now() - stepStartedAt;

    const stepEntry = {
      stageIndex,
      actionId: action.id,
      service: action.config.service,
      status: 'SUCCESS',
      dataOut: stepResult ?? null,
      startedAt: new Date(stepStartedAt).toISOString(),
      completedAt: new Date().toISOString(),
      duration: stepDuration,
    };

    const currentRun = await prisma.relayRun.findUnique({
      where: { id: relayRunId },
      select: { executionHistory: true }
    });

    const updatedHistory = [...(currentRun?.executionHistory || []), stepEntry];

    await prisma.relayRun.update({
      where: { id: relayRunId },
      data: {
        currentStage: { increment: 1 },
        executionHistory: updatedHistory,
      }
    });

    await produceMessage(TOPICS.WORKFLOW_COMMANDS, relayRunId, {
      type: 'STEP_COMPLETED',
      relayRunId,
      relayId,
      userId,
      triggerData,
    });

    logger.info('Worker: Action completed and next step triggered', {
      relayRunId,
      stage: stageIndex,
      duration: stepDuration,
    });

  } catch (err) {
    const stepDuration = Date.now() - stepStartedAt;
    logger.error('Worker: Permanent failure executing action', {
      relayRunId,
      actionId: action.id,
      error: err.message,
      stack: err.stack
    });

    const failedEntry = {
      stageIndex,
      actionId: action.id,
      service: action.config.service,
      status: 'FAILURE',
      error: err.message,
      startedAt: new Date(stepStartedAt).toISOString(),
      completedAt: new Date().toISOString(),
      duration: stepDuration,
    };

    const currentRun = await prisma.relayRun.findUnique({
      where: { id: relayRunId },
      select: { executionHistory: true }
    });

    const updatedHistory = [...(currentRun?.executionHistory || []), failedEntry];

    await prisma.$transaction([
      prisma.relayRun.update({
        where: { id: relayRunId },
        data: {
          status: RUN_STATUS.FAILURE,
          errorMessage: err.message,
          completedAt: new Date(),
          executionHistory: updatedHistory,
        }
      }),
      prisma.relay.update({
        where: { id: relayId },
        data: { failureCount: { increment: 1 } }
      })
    ]);

    await storeFailed(actionEvent, {
      error: err.message,
      stack: err.stack
    });
  }
};
