import { createConsumer } from '#util/kafka.js';
import { TOPICS, CONSUMER_GROUPS } from '#config/kafka.config.js';
import * as dlqService from './dlq.service.js';
import logger from '#util/logger.js';

let consumer = null;

export const startDLQConsumer = async () => {
  if (consumer) return consumer;

  try {
    consumer = await createConsumer(CONSUMER_GROUPS.DLQ);
    await consumer.subscribe({ topics: [TOPICS.DEAD_LETTER_QUEUE], fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const failedEvent = JSON.parse(message.value.toString());
          logger.info('DLQ: Received failed message', { 
            partition,
            offset: message.offset
          });
          
          const errorInfo = {
            error: message.headers?.error?.toString() || 'Unknown error',
            stack: message.headers?.stack?.toString() || ''
          };

          await dlqService.storeFailed(failedEvent, errorInfo);
        } catch (err) {
          logger.error('DLQ: Failed to process message', {
            error: err.message,
            partition,
            offset: message.offset
          });
        }
      },
    });

    logger.info('DLQ consumer started successfully');
  } catch (err) {
    logger.error("DLQ: Failed to start consumer", err);
    throw err;
  }
};

export const stopDLQConsumer = async () => {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumer = null;
      logger.info('DLQ consumer disconnected gracefully');
    } catch (err) {
      logger.error('DLQ: Error during consumer disconnect', err);
    }
  }
};

