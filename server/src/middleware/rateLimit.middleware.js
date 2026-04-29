import { asyncHandler } from "#util/asyncHandler.js";
import { ApiError } from "#util/ApiError.js";
import { redisClient } from "#db/redis.db.js";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "#util/logger.js";
import envConfig from "#config/env.config.js";

export const globalSlowDown = (options = {}) => {
  const {
    windowMs = envConfig.GLOBAL_SLOWDOWN_WINDOW_MS,
    prefix = envConfig.GLOBAL_SLOWDOWN_PREFIX,
    threshold = envConfig.GLOBAL_SLOWDOWN_THRESHOLD,
    calcDelayMs = (hitsOver) => hitsOver * envConfig.GLOBAL_SLOWDOWN_DELAY_STEP_MS
  } = options;

  return asyncHandler(async (req, res, next) => {
    try {
      const key = `${prefix}${req.clientIp || req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"}`;
      if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
        try { await redisClient.connect(); } catch (_) { }
      }

      const tx = redisClient.multi();
      tx.incr(key);
      tx.expire(key, Math.ceil(windowMs / 1000));
      const [hits] = await tx.exec();
      const current = Array.isArray(hits) ? Number(hits[1]) : Number(hits);

      if (Number.isNaN(current)) {
        return next();
      }

      if (current <= threshold) {
        return next();
      }

      const delay = calcDelayMs(current - threshold);
      setTimeout(next, Math.max(0, delay));
    } catch (_) {
      return next();
    }
  });
};

export const sensitiveRateLimiter = (options = {}) => {
  const {
    windowMs = envConfig.SENSITIVE_RATE_LIMIT_WINDOW_MS,
    max = envConfig.SENSITIVE_RATE_LIMIT_MAX_REQUESTS,
    prefix = envConfig.SENSITIVE_RATE_LIMIT_PREFIX
  } = options;

  return rateLimit({
    windowMs,
    max: envConfig.NODE_ENV === 'development' ? 1000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      const error = ApiError.tooManyRequests(options.message || "Too many requests, please try again later.");
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors
      });
    },
    store: new RedisStore({
      sendCommand: async (...args) => {
        try {
          if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
            await redisClient.connect().catch(() => { });
          }
          return await redisClient.call(...args);
        } catch (error) {
          logger.error("Redis error in rateLimiter", { error: error.message });
          return 0;
        }
      },
      prefix
    })
  });
};

export const downloadRateLimiter = (options = {}) => {
  const {
    windowMs = envConfig.DOWNLOAD_RATE_LIMIT_WINDOW_MS,
    max = envConfig.DOWNLOAD_RATE_LIMIT_MAX_REQUESTS,
    prefix = envConfig.DOWNLOAD_RATE_LIMIT_PREFIX
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      const error = ApiError.tooManyRequests(options.message || "Maximum download limit reached");
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors
      });
    },
    keyGenerator: (req) => {
      const jobId = req.params?.jobId || 'unknown';
      return `${prefix}file:${jobId}`; 
    },
    store: new RedisStore({
      sendCommand: async (...args) => {
        try {
          if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
            await redisClient.connect();
          }
        } catch (_) { }
        return redisClient.call(...args);
      },
      prefix
    })
  });
};
