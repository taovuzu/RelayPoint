import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { redisClient } from "../queues/queue.service.js";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

export const globalSlowDown = (options = {}) => {
  const envWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || (15 * 60 * 1000);
  const envThreshold = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
  const {
    windowMs = envWindowMs,
    prefix = "slowdown:",
    threshold = envThreshold,
    calcDelayMs = (hitsOver) => hitsOver * 100
  } = options;

  return asyncHandler(async (req, res, next) => {
    try {
      const key = `${prefix}${req.clientIp || req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"}`;

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
  const envWindowMs = Number(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || (10 * 60 * 1000);
  const envMax = Number(process.env.SENSITIVE_RATE_LIMIT_MAX_REQUESTS) || 10;
  const {
    windowMs = envWindowMs,
    max = envMax,
    prefix = "hardlimit:"
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req, res) => {
      throw new ApiError(429, "Too many requests, please try again later.");
    },
    keyGenerator: (req) => req.clientIp || req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown",
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix
    })
  });
};
