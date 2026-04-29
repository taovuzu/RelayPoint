import prisma from '#db/index.db.js';
import { ApiError } from '#util/ApiError.js';
import { RUN_STATUS, OUTBOX_STATUS, TRIGGER_TYPES } from "#constant.js";
import logger from '#util/logger.js';
import { getAppByService, findTriggerByKey } from '#apps/app-loader.js';
import { createGlobalVariable } from '#apps/global-variable.js';
import envConfig from '#config/env.config.js';

export const processWebhookTrigger = async (triggerId, payload) => {
  if (!payload) throw ApiError.badRequest("Empty payload");

  const relay = await prisma.relay.findFirst({
    where: {
      webhookUrl: triggerId,
      active: true,
    },
  });

  if (!relay) {
    throw ApiError.notFound("No active workflow found for this webhook trigger");
  }

  const recentRunsCount = await prisma.relayRun.count({
    where: {
      relayId: relay.id,
      createdAt: { gte: new Date(Date.now() - envConfig.WORKFLOW_LOOP_WINDOW_MS) }
    }
  });

  if (recentRunsCount > envConfig.WORKFLOW_LOOP_THRESHOLD) {
    logger.warn(`Relay ${relay.id} is in a potential infinite loop! Skipping ingestion.`, { 
      recentRunsCount,
      threshold: envConfig.WORKFLOW_LOOP_THRESHOLD
    });
    return [];
  }

  const triggerDefInfo = findTriggerByKey(relay.trigger.id);
  if (!triggerDefInfo || !triggerDefInfo.trigger) {
    throw ApiError.internalServer(`Trigger definition not found: ${relay.trigger.id}`);
  }
  const { app, trigger } = triggerDefInfo;

  const $ = await createGlobalVariable({
    app,
    userId: relay.userId,
    stepParameters: relay.trigger.config,
  });
  
  $.request = payload || {};

  await trigger.run($);

  if (!$.triggerOutput.data || $.triggerOutput.data.length === 0) {
    logger.info(`Webhook ingestion yielded no items: Relay ${relay.id}`);
    return [];
  }

  return await prisma.$transaction(async (tx) => {
    const results = [];
    
    for (const item of $.triggerOutput.data) {
      const relayRun = await tx.relayRun.create({
        data: {
          relayId: relay.id,
          userId: relay.userId,
          triggerMetadata: item.raw,
        },
      });

      await tx.relayRunOutbox.create({
        data: {
          relayRunId: relayRun.id,
          userId: relay.userId,
          status: OUTBOX_STATUS.PENDING,
          payload: {
            type: "WORKFLOW_STARTED",
            relayRunId: relayRun.id,
            relayId: relay.id,
            userId: relay.userId,
            triggerData: item.raw,
          },
        },
      });
      
      results.push({ relayRunId: relayRun.id });
    }

    await tx.relay.update({
      where: { id: relay.id },
      data: {
        runCount: { increment: results.length },
        lastRunAt: new Date(),
      },
    });

    logger.info(`Webhook ingestion successful: Relay ${relay.id}, created ${results.length} runs`);
    return results;
  });
};

export const processNangoSyncTrigger = async (userId, service, record) => {
  const activeRelays = await prisma.relay.findMany({
    where: {
      userId,
      active: true,
    }
  });

  const app = getAppByService(service);
  if (!app) {
    throw ApiError.internal(`Processing failed: No app definition found for service "${service}".`);
  }

  const results = [];

  for (const relay of activeRelays) {
    const triggerDefInfo = findTriggerByKey(relay.trigger.id);
    if (!triggerDefInfo || triggerDefInfo.app.key !== app.key) continue;

    const recentRunsCount = await prisma.relayRun.count({
      where: {
        relayId: relay.id,
        createdAt: { gte: new Date(Date.now() - envConfig.WORKFLOW_LOOP_WINDOW_MS) }
      }
    });

    if (recentRunsCount > envConfig.WORKFLOW_LOOP_THRESHOLD) {
      logger.warn(`Relay ${relay.id} (Nango Sync) is in a potential infinite loop! Skipping.`, { 
        recentRunsCount, 
        threshold: envConfig.WORKFLOW_LOOP_THRESHOLD 
      });
      continue;
    }

    const { trigger } = triggerDefInfo;
    if (!trigger) {
       logger.error(`Active relay ${relay.id} has no valid trigger definition: ${relay.trigger.id}`);
       continue;
    }

    const $ = await createGlobalVariable({
      app,
      userId,
      stepParameters: relay.trigger.config,
    });
    
    $.request = record || {};

    await trigger.run($);

    if (!$.triggerOutput.data || $.triggerOutput.data.length === 0) continue;

    for (const item of $.triggerOutput.data) {
      const result = await prisma.$transaction(async (tx) => {
        const relayRun = await tx.relayRun.create({
          data: {
            relayId: relay.id,
            userId: relay.userId,
            triggerMetadata: item.raw,
          },
        });

        await tx.relayRunOutbox.create({
          data: {
            relayRunId: relayRun.id,
            userId: relay.userId,
            status: OUTBOX_STATUS.PENDING,
            payload: {
              type: "WORKFLOW_STARTED",
              relayRunId: relayRun.id,
              relayId: relay.id,
              userId: relay.userId,
              triggerData: item.raw,
            },
          },
        });

        await tx.relay.update({
          where: { id: relay.id },
          data: {
            runCount: { increment: 1 },
            lastRunAt: new Date(),
          },
        });

        return { relayId: relay.id, relayRunId: relayRun.id };
      });
      
      results.push(result);
      logger.info(`Nango Sync ingestion successful: Relay ${relay.id}, Run ${result.relayRunId}`);
    }
  }

  return results;
};


// ref: https://www.prisma.io/docs/orm/prisma-client/queries/transactions

