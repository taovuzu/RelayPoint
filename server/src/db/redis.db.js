import Redis from 'ioredis';
import envConfig from '#config/env.config.js';
import { ApiError } from '#util/ApiError.js';

const redisClient = new Redis({
  username: envConfig.REDIS_USERNAME,
  password: envConfig.REDIS_PASSWORD,
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  lazyConnect: true,
  commandTimeout: 5000,
  maxRetriesPerRequest: 3
});

let isConnected = false;

redisClient.on('error', (err) => {
  isConnected = false;
});
redisClient.on('connect', () => {
  isConnected = true;
});
redisClient.on('disconnect', () => {
  isConnected = false;
});
redisClient.on('ready', () => {
  isConnected = true;
});

async function connectRedis() {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
      isConnected = true;
    }
  } catch (error) {
    throw ApiError.internal(`Redis connection failed: ${error.message}`);
  }
}

async function healthCheck() {
  try {
    if (redisClient.status !== 'ready') {
      return false; 
    }
    const pingPromise = redisClient.ping();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Ping timeout")), 2000));
    await Promise.race([pingPromise, timeoutPromise]);
    return true;
  } catch (error) {
    isConnected = false;
    return false;
  }
}

export { connectRedis, healthCheck, redisClient };

// ref: https://www.npmjs.com/package/ioredis
// ref: https://redis.io/docs/latest/commands/
