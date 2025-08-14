import 'dotenv/config';
import connectDB from './db/index.db.js';
import { initializeTopics, shutdownKafka } from './config/kafka.js';
import { outboxPoller } from './jobs/outboxPoller.job.js';
import logger from './utils/logger.js';

async function startWorker() {
  try {
    logger.info('Starting RelayPoint Worker...');

    await connectDB();
    logger.info('Database connected successfully');

    await initializeTopics();
    logger.info('Kafka topics initialized');

    await outboxPoller.start();
    logger.info('Outbox poller started successfully');

    logger.info('RelayPoint Worker is running', {
      processId: process.pid,
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    logger.error('Failed to start worker', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down worker gracefully...`);

  try {
    outboxPoller.stop();
    logger.info('Outbox poller stopped');

    await shutdownKafka();
    logger.info('Kafka connections closed');

    logger.info('Worker shutdown completed');
    process.exit(0);

  } catch (error) {
    logger.error('Error during worker shutdown', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception in worker', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection in worker', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});

startWorker();
