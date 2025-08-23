import request from '@/request/request';

export const getHealthStatus = () => request.health.getStatus();
export const getRedisHealth = () => request.health.getRedis();
export const getMongoDBHealth = () => request.health.getMongoDB();
export const getAllSystemsHealth = () => request.health.getAll();
