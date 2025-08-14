import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

try {
  const hasUrl = Boolean(process.env.REDIS_URL);
  const hasHost = Boolean(process.env.REDIS_HOST);
  const hasPort = Boolean(process.env.REDIS_PORT);

  if (hasUrl) {
    logger.info('Initializing Redis client using REDIS_URL');
    redisClient = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
    });
  } else if (hasHost && hasPort) {
    logger.info('Initializing Redis client using REDIS_HOST and REDIS_PORT');
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
    });
  } else {
    if (!hasUrl) logger.warn('REDIS_URL is not defined');
    if (!hasHost) logger.warn('REDIS_HOST is not defined');
    if (!hasPort) logger.warn('REDIS_PORT is not defined');
    if (!process.env.REDIS_PASSWORD) logger.info('REDIS_PASSWORD is not defined (optional)');
    throw new Error('Missing Redis configuration. Define REDIS_URL or REDIS_HOST and REDIS_PORT');
  }

  if (redisClient && typeof redisClient.hSet !== 'function' && typeof redisClient.hset === 'function') {
    redisClient.hSet = (...args) => redisClient.hset(...args);
  }

  if (redisClient) {
    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', {
        error: error.message,
        stack: error.stack
      });
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }
} catch (error) {
  logger.error('Failed to initialize Redis client:', {
    error: error.message,
    stack: error.stack
  });
}

export async function healthCheck() {
  if (!redisClient) {
    return {
      status: 'error',
      message: 'Redis client not initialized'
    };
  }

  try {
    await redisClient.ping();
    return {
      status: 'ok',
      message: 'Redis connection healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Redis health check failed: ${error.message}`
    };
  }
}

export async function shutdownRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error.message);
    }
  }
}

export { redisClient };
