import 'dotenv/config';
import prisma from '#db/index.db.js';
import { app } from '#app.js';
import logger from '#util/logger.js';
import { validateEnv } from '#config/env.config.js';

import { startRelay, stopRelay } from '#features/trigger-relay/relay.worker.js';
import { startOrchestratorConsumer, stopOrchestratorConsumer } from '#features/orchestrator/orchestrator.consumer.js';
import { startWorkerConsumer, stopWorkerConsumer } from '#features/worker/worker.consumer.js';
import { startDLQConsumer, stopDLQConsumer } from '#features/dlq/dlq.consumer.js';
import { disconnectKafka, ensureTopics } from '#util/kafka.js';

let server;

async function start() {
  try {
    logger.info('Starting server initialization');
    validateEnv();

    await prisma.$connect();
    logger.info('Database connected successfully');

    await ensureTopics();

    startRelay();
    
    await startOrchestratorConsumer();
    await startWorkerConsumer();
    await startDLQConsumer();


    const PORT = process.env.PORT;
    server = app.listen(PORT, () => {
      logger.info(`Server started successfully on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);

  try {
    stopRelay();
    await stopOrchestratorConsumer();
    await stopWorkerConsumer();
    await stopDLQConsumer();
    await disconnectKafka();

    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }

    await prisma.$disconnect();
    logger.info('Prisma disconnected');

    logger.info('Server shutdown completed');
  } catch (err) {
    logger.error('Error during shutdown', {
      error: err.message,
      stack: err.stack
    });
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    error: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  shutdown('unhandledRejection');
});

start();

// ref: https://nodejs.org/api/process.html
