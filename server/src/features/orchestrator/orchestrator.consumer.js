import { createConsumer } from '#util/kafka.js';
import { TOPICS, CONSUMER_GROUPS } from '#config/kafka.config.js';
import * as orchestratorService from './orchestrator.service.js';
import logger from '#util/logger.js';

let consumer = null;

export async function startOrchestratorConsumer() {
  if (consumer) return consumer;
  
  try {
    consumer = await createConsumer(CONSUMER_GROUPS.ORCHESTRATOR);
    await consumer.subscribe({ topics: [TOPICS.WORKFLOW_COMMANDS], fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          logger.info('Orchestrator: Received workflow command', { 
            relayRunId: event.relayRunId, 
            type: event.type,
            partition,
            offset: message.offset
          });
          await orchestratorService.processEvent(event);
        } catch (parseErr) {
          logger.error('Orchestrator: Failed to parse or process message', {
            error: parseErr.message,
            partition,
            offset: message.offset
          });
        }
      },
    });

    logger.info('Orchestrator consumer started successfully');
  } catch (err) {
    logger.error("Orchestrator: Failed to start consumer", err);
    throw err;
  }
}

export async function stopOrchestratorConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumer = null;
      logger.info('Orchestrator consumer disconnected gracefully');
    } catch (err) {
      logger.error('Orchestrator: Error during consumer disconnect', err);
    }
  }
}

// ref: https://kafka.js.org/docs/consuming
