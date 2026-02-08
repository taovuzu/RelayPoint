import prisma from '#db/index.db.js';
import { ApiError } from '#util/ApiError.js';
import { RUN_STATUS, OUTBOX_STATUS } from "#constant.js";
import logger from '#util/logger.js';

export const processWebhookTrigger = async (triggerId, payload) => {
  if (!payload) throw ApiError.badRequest("Empty payload");

  return await prisma.$transaction(async (tx) => {
    const relay = await tx.relay.findFirst({
      where: {
        webhookUrl: triggerId,
        active: true,
      },
    });

    if (!relay) {
      throw ApiError.notFound("No active workflow found for this webhook trigger");
    }

    const relayRun = await tx.relayRun.create({
      data: {
        relayId: relay.id,
        userId: relay.userId,
        triggerMetadata: payload,
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
          triggerData: payload,
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

    logger.info(`Webhook ingestion successful: Relay ${relay.id}, Run ${relayRun.id}`);

    return { relayRunId: relayRun.id };
  });
};

// ref: https://www.prisma.io/docs/orm/prisma-client/queries/transactions

