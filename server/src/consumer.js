import 'dotenv/config';
import connectDB from './db/index.db.js';
import { initializeTopics, shutdownKafka } from './config/kafka.js';
import { relayExecutorConsumer } from './consumers/relayExecutor.consumer.js';
import logger from './utils/logger.js';

async function startConsumer() {
  try {
    logger.info('Starting RelayPoint Consumer...');

    await connectDB();
    logger.info('Database connected successfully');

    await initializeTopics();
    logger.info('Kafka topics initialized');

    await relayExecutorConsumer.start();
    logger.info('Relay executor consumer started successfully');

    logger.info('RelayPoint Consumer is running', {
      processId: process.pid,
      environment: process.env.NODE_ENV || 'development',
      groupId: relayExecutorConsumer.groupId
    });

  } catch (error) {
    logger.error('Failed to start consumer', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down consumer gracefully...`);

  try {
    await relayExecutorConsumer.stop();
    logger.info('Relay executor consumer stopped');

    await shutdownKafka();
    logger.info('Kafka connections closed');

    logger.info('Consumer shutdown completed');
    process.exit(0);

  } catch (error) {
    logger.error('Error during consumer shutdown', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception in consumer', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection in consumer', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});

startConsumer();
