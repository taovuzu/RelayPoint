import { createConsumer } from '#util/kafka.js';
import { TOPICS, CONSUMER_GROUPS } from '#config/kafka.config.js';
import * as workerService from './worker.service.js';
import logger from '#util/logger.js';

let consumer = null;

export const startWorkerConsumer = async () => {
  if (consumer) return consumer;

  try {
    consumer = await createConsumer(CONSUMER_GROUPS.WORKER);
    await consumer.subscribe({ topics: [TOPICS.ACTION_COMMANDS], fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          logger.info('Worker: Received action command', { 
            relayRunId: event.relayRunId, 
            actionId: event.action?.id,
            partition,
            offset: message.offset
          });
          await workerService.executeAction(event);
        } catch (err) {
          logger.error('Worker: Failed to process action message', {
            error: err.message,
            partition,
            offset: message.offset
          });
        }
      },
    });

    logger.info('Worker consumer started successfully');
  } catch (err) {
    logger.error("Worker: Failed to start consumer", err);
    throw err;
  }
};

export const stopWorkerConsumer = async () => {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumer = null;
      logger.info('Worker consumer disconnected gracefully');
    } catch (err) {
      logger.error('Worker: Error during consumer disconnect', err);
    }
  }
};

// ref: https://kafka.js.org/docs/consuming
