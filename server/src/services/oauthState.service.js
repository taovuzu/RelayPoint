import Redis from 'ioredis';
import logger from '../utils/logger.js';
import { EncryptionService } from './encryption.service.js';

let oauthRedisClient = null;

try {
  const hasUrl = Boolean(process.env.REDIS_URL);
  const hasHost = Boolean(process.env.REDIS_HOST);
  const hasPort = Boolean(process.env.REDIS_PORT);

  if (hasUrl) {
    logger.info('Initializing OAuth Redis client using REDIS_URL');
    oauthRedisClient = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
      keyPrefix: 'oauth:',
    });
  } else if (hasHost && hasPort) {
    logger.info('Initializing OAuth Redis client using REDIS_HOST and REDIS_PORT');
    oauthRedisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      enableOfflineQueue: true,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
      keyPrefix: 'oauth:',
    });
  } else {
    throw new Error('Missing Redis configuration for OAuth state management');
  }

  if (oauthRedisClient) {
    oauthRedisClient.on('connect', () => {
      logger.info('OAuth Redis client connected successfully');
    });

    oauthRedisClient.on('error', (error) => {
      logger.error('OAuth Redis connection error:', {
        error: error.message,
        stack: error.stack
      });
    });

    oauthRedisClient.on('close', () => {
      logger.warn('OAuth Redis connection closed');
    });
  }
} catch (error) {
  logger.error('Failed to initialize OAuth Redis client:', {
    error: error.message,
    stack: error.stack
  });
}


export class OAuthStateService {
  static async storeState(state, data, ttl = 600) {
    if (!oauthRedisClient) {
      throw new Error('OAuth Redis client not initialized');
    }

    try {
      const stateData = {
        ...data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (ttl * 1000)
      };

      await oauthRedisClient.setex(`state:${state}`, ttl, JSON.stringify(stateData));
      logger.debug('OAuth state stored', { state: state.substring(0, 8) + '...', ttl });
      return true;
    } catch (error) {
      logger.error('Failed to store OAuth state', { error: error.message, state: state.substring(0, 8) + '...' });
      return false;
    }
  }

  static async getState(state) {
    if (!oauthRedisClient) {
      throw new Error('OAuth Redis client not initialized');
    }

    try {
      const data = await oauthRedisClient.get(`state:${state}`);
      if (!data) {
        logger.debug('OAuth state not found or expired', { state: state.substring(0, 8) + '...' });
        return null;
      }

      const parsedData = JSON.parse(data);

      if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
        await oauthRedisClient.del(`state:${state}`);
        logger.debug('OAuth state expired', { state: state.substring(0, 8) + '...' });
        return null;
      }

      logger.debug('OAuth state retrieved', { state: state.substring(0, 8) + '...' });
      return parsedData;
    } catch (error) {
      logger.error('Failed to retrieve OAuth state', { error: error.message, state: state.substring(0, 8) + '...' });
      return null;
    }
  }

  static async deleteState(state) {
    if (!oauthRedisClient) {
      throw new Error('OAuth Redis client not initialized');
    }

    try {
      const result = await oauthRedisClient.del(`state:${state}`);
      logger.debug('OAuth state deleted', { state: state.substring(0, 8) + '...', deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Failed to delete OAuth state', { error: error.message, state: state.substring(0, 8) + '...' });
      return false;
    }
  }

  static generateState() {
    return EncryptionService.generateRandomString(32);
  }

  static isValidState(state) {
    return typeof state === 'string' && state.length >= 16 && state.length <= 64;
  }

  static async cleanupExpiredStates() {
    if (!oauthRedisClient) {
      throw new Error('OAuth Redis client not initialized');
    }

    try {
      const keys = await oauthRedisClient.keys('oauth:state:*');
      let cleanedCount = 0;

      for (const key of keys) {
        const data = await oauthRedisClient.get(key);
        if (data) {
          const parsedData = JSON.parse(data);
          if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
            await oauthRedisClient.del(key);
            cleanedCount++;
          }
        }
      }

      logger.info('OAuth state cleanup completed', { cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired OAuth states', { error: error.message });
      return 0;
    }
  }

  static async healthCheck() {
    if (!oauthRedisClient) {
      return {
        status: 'error',
        message: 'OAuth Redis client not initialized'
      };
    }

    try {
      await oauthRedisClient.ping();
      return {
        status: 'ok',
        message: 'OAuth Redis connection healthy'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `OAuth Redis health check failed: ${error.message}`
      };
    }
  }
}

export default OAuthStateService;
