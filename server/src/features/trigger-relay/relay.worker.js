import prisma from '#db/index.db.js';
import { produceMessage } from '#util/kafka.js';
import { TOPICS } from '#config/kafka.config.js';
import logger from '#util/logger.js';
import { OUTBOX_STATUS } from '#constant.js';


export const processBatch = async (jobLimit = 50) => {
  return await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      SELECT id, payload, "relayRunId" 
      FROM "RelayRunOutbox" 
      WHERE status = 'PENDING' 
      ORDER BY "createdAt" ASC 
      LIMIT ${jobLimit} 
      FOR UPDATE SKIP LOCKED`;

    if (!rows || rows.length === 0) return 0;

    for (const row of rows) {
      await produceMessage(TOPICS.WORKFLOW_COMMANDS, row.relayRunId, row.payload);
    }

    const ids = rows.map((r) => r.id);
    await tx.relayRunOutbox.updateMany({
      where: { id: { in: ids } },
      data: { status: OUTBOX_STATUS.COMPLETED },
    });

    logger.info(`Relayed ${rows.length} messages from outbox to Kafka`, {
      ids,
      topic: TOPICS.WORKFLOW_COMMANDS,
    });

    return rows.length;
  });
};

let relayInterval = null;

export const startRelay = (intervalMs = 60000) => {
  if (relayInterval) {
    logger.warn('Relay worker is already running');
    return;
  }

  logger.info(`Starting Outbox Relay worker (interval: ${intervalMs}ms)`);

  relayInterval = setInterval(async () => {
    try {
      await processBatch();
    } catch (err) {
      logger.error('Error in Outbox Relay worker batch execution', {
        error: err.message,
        stack: err.stack
      });
    }
  }, intervalMs);
};

export const stopRelay = () => {
  if (relayInterval) {
    clearInterval(relayInterval);
    relayInterval = null;
    logger.info('Outbox Relay worker stopped');
  } else {
    logger.warn('Attempted to stop relay worker, but it was not running');
  }
};

// ref: https://www.netdata.cloud/academy/update-skip-locked/ (important)
// ref: https://www.inferable.ai/blog/posts/postgres-skip-locked (important)
// ref: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries
// ref: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
// ref: https://microservices.io/patterns/data/transactional-outbox.html
