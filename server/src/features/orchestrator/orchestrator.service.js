import prisma from '#db/index.db.js';
import { produceMessage } from '#util/kafka.js';
import { TOPICS } from '#config/kafka.config.js';
import logger from '#util/logger.js';
import { RUN_STATUS } from '#constant.js'


export const processEvent = async (event) => {
  const { type, relayRunId, relayId, userId, triggerData } = event;

  try {
    const relayRun = await prisma.relayRun.findUnique({
      where: { id: relayRunId }
    });

    if (!relayRun) {
      logger.warn('Orchestrator: RelayRun not found', { relayRunId });
      return;
    }

    if (relayRun.status === RUN_STATUS.SUCCESS || relayRun.status === RUN_STATUS.FAILURE) {
      logger.info('Orchestrator: Run already finished, skipping', { relayRunId, status: relayRun.status });
      return;
    }
    const relay = await prisma.relay.findUnique({
      where: { id: relayId }
    });

    if (!relay) {
      logger.error('Orchestrator: Relay not found', { relayId, relayRunId });
      return;
    }

    const actions = relay.actions || [];

    const currentAction = actions[relayRun.currentStage];

    if (currentAction) {
      logger.info('Orchestrator: Dispatching next action', {
        relayRunId,
        stage: relayRun.currentStage,
        actionId: currentAction.id
      });

      await produceMessage(TOPICS.ACTION_COMMANDS, relayRunId, {
        relayRunId,
        relayId,
        userId,
        action: currentAction,
        stageIndex: relayRun.currentStage,
        triggerData
      });
    } else {
      logger.info('Orchestrator: Workflow finished successfully', { relayRunId });

      const completedAt = new Date();
      const startedAt = new Date(relayRun.startedAt);
      const totalDuration = completedAt.getTime() - startedAt.getTime();

      await prisma.$transaction([
        prisma.relayRun.update({
          where: { id: relayRunId },
          data: {
            status: RUN_STATUS.SUCCESS,
            completedAt,
            totalDuration,
          }
        }),
        prisma.relay.update({
          where: { id: relayId },
          data: {
            successCount: { increment: 1 }
          }
        })
      ]);
    }
  } catch (error) {
    logger.error('Orchestrator: Failed to process event', {
      relayRunId,
      error: error.message,
      stack: error.stack
    });
  }
};

// ref: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
