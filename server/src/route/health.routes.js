import { Router } from "express";
import { asyncHandler } from "#util/asyncHandler.js";
import { healthCheck as redisHealthCheck } from "#db/redis.db.js";
import prisma from "#db/index.db.js";
import envConfig from "#config/env.config.js";

const router = Router();


router.get("/redis", asyncHandler(async (req, res) => {
  const isHealthy = await redisHealthCheck();

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    statusCode: isHealthy ? 200 : 503,
    message: isHealthy ? "Redis connection is healthy" : "Redis connection is not healthy",
    data: {
      redis: isHealthy,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));


router.get("/database", asyncHandler(async (req, res) => {
  let isHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isHealthy = true;
  } catch (error) {
    isHealthy = false;
  }

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    statusCode: isHealthy ? 200 : 503,
    message: isHealthy ? "Database connection is healthy" : "Database connection is not healthy",
    data: {
      database: isHealthy,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));


router.get("/all", asyncHandler(async (req, res) => {
  const [redisHealthy, dbHealthy] = await Promise.all([
    redisHealthCheck(),
    (async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    })()
  ]);

  const allHealthy = redisHealthy && dbHealthy;

  return res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    statusCode: allHealthy ? 200 : 503,
    message: allHealthy ? "All systems are healthy" : "Some systems are unhealthy",
    data: {
      environment: envConfig.NODE_ENV,
      systems: {
        server: true,
        redis: redisHealthy,
        database: dbHealthy
      },
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Server is running correctly",
    data: {
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

export default router;
