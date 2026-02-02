import { asyncHandler } from '#util/asyncHandler.js';
import { ApiResponse } from '#util/ApiResponse.js';
import { ApiError } from '#util/ApiError.js';
import * as connectionService from './connection.service.js';

export const createConnection = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { service, connectionId, accountIdentifier } = req.body || {};

  if (!service || !connectionId) {
    throw ApiError.badRequest('Service and Connection ID are required');
  }

  const connection = await connectionService.createConnection(userId, { 
    service, 
    connectionId, 
    accountIdentifier 
  });

  return ApiResponse
    .success(connection, "Connection created successfully", 201)
    .withRequest(req)
    .send(res);
});

export const getConnections = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connections = await connectionService.getConnections(userId);

  return ApiResponse
    .success(connections, "Connections fetched successfully")
    .withRequest(req)
    .send(res);
});

export const getConnectionById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connectionId = req.params.id;

  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required');
  }
  const connection = await connectionService.getConnectionById(userId, connectionId);

  return ApiResponse
    .success(connection, "Connection details fetched successfully")
    .withRequest(req)
    .send(res);
});

export const deleteConnection = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connectionId = req.params.id;
  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required');
  }
  await connectionService.deleteConnection(userId, connectionId);

  return ApiResponse
    .success(null, "Connection deleted successfully")
    .withRequest(req)
    .send(res);
});

export const getSessionToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { allowed_integrations = [] } = req.body || {};
  const sessionToken = await connectionService.createConnectSession(userId, allowed_integrations);

  return ApiResponse
    .success({ sessionToken }, "Session token generated successfully")
    .withRequest(req)
    .send(res);
});

export default { createConnection, getConnections, getConnectionById, deleteConnection, getSessionToken };
