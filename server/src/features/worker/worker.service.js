import prisma from '#db/index.db.js';
import { withAuthRetry } from '#util/retry.js';
import { produceMessage } from '#util/kafka.js';
import { TOPICS } from '#config/kafka.config.js';
import { isAlreadyProcessed, markInProgress } from './idempotency.service.js';
import { storeFailed } from '#features/dlq/dlq.service.js';
import logger from '#util/logger.js';
import { getNangoConnectionId, healConnectionTokens } from "#features/connection/connection.service.js";
import { interpolate } from '#util/interpolation.js';
import * as gmail from '#features/integrations/gmail.client.js';
import * as slack from '#features/integrations/slack.client.js';
import * as github from '#features/integrations/github.client.js';
import * as notion from '#features/integrations/notion.client.js';
import { ACTION_TYPES, RUN_STATUS } from '#constant.js';

export const executeAction = async (actionEvent) => {
  const { relayRunId, relayId, userId, action, stageIndex, triggerData } = actionEvent;

  const isProcessed = await isAlreadyProcessed(relayRunId, stageIndex);
  if (isProcessed) {
    logger.info('Worker: Skipping duplicate or already processed action', { relayRunId, stageIndex });
    return;
  }

  if (stageIndex === 0) {
    const marked = await markInProgress(relayRunId);
    if (!marked) {
      logger.warn('Worker: Failed to mark run in progress (already started by another worker)', { relayRunId });
      return;
    }
  }

  const healAuthCallback = async () => healConnectionTokens(userId, action.config.service);

  try {
    await withAuthRetry(async () => {
      // Resolve Dynamic Variables in Config -> interpolate variables like {{title}} from triggerData into action.config
      const interpolatedConfig = interpolate(action.config, triggerData);
      
      logger.info('Worker: Executing action', { 
        relayRunId, 
        actionId: action.id, 
        stage: stageIndex,
        service: action.config.service 
      });

      const nangoConnectionId = await getNangoConnectionId(userId, action.config.service);

      switch (action.id) {
        case ACTION_TYPES.SEND_EMAIL:
          await gmail.sendEmail(nangoConnectionId, interpolatedConfig);
          break;
        case ACTION_TYPES.POST_SLACK_MESSAGE:
          await slack.postMessage(nangoConnectionId, interpolatedConfig);
          break;
        case ACTION_TYPES.CREATE_GITHUB_ISSUE:
          await github.createIssue(nangoConnectionId, interpolatedConfig);
          break;
        case ACTION_TYPES.CREATE_NOTION_PAGE:
          await notion.createPage(nangoConnectionId, interpolatedConfig);
          break;
        default:
          throw new Error(`Unknown action type: ${action.id}`);
      }

      await prisma.relayRun.update({
        where: { id: relayRunId },
        data: { currentStage: { increment: 1 } }
      });

      await produceMessage(TOPICS.WORKFLOW_COMMANDS, relayRunId, {
        type: 'STEP_COMPLETED',
        relayRunId,
        relayId,
        userId,
        triggerData
      });

      logger.info('Worker: Action completed and next step triggered', { relayRunId, stage: stageIndex });
    }, healAuthCallback);

  } catch (err) {
    logger.error('Worker: Permanent failure executing action', { 
      relayRunId, 
      actionId: action.id, 
      error: err.message,
      stack: err.stack 
    });

    await prisma.$transaction([
      prisma.relayRun.update({
        where: { id: relayRunId },
        data: { 
          status: RUN_STATUS.FAILURE, 
          errorMessage: err.message, 
          completedAt: new Date() 
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


// ref: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
// ref: https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
// ref: https://kafka.js.org/docs/producing
