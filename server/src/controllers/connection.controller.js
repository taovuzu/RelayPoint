import { Connection } from '../models/connection.model.js';
import { EncryptionService } from '../services/encryption.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const getUserConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connections = await Connection.find({
    userId,
    isActive: true
  }).select('-encryptedCredentials -iv').sort({ updatedAt: -1 });

  return ApiResponse.success(
    { connections },
    'User connections retrieved successfully',
    200
  ).withRequest(req).send(res);
});

export const getConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user._id;

  const connection = await Connection.findOne({
    _id: connectionId,
    userId,
    isActive: true
  }).select('-encryptedCredentials -iv');

  if (!connection) {
    throw ApiError.notFound('Connection not found');
  }

  return ApiResponse.success(
    { connection },
    'Connection retrieved successfully',
    200
  ).withRequest(req).send(res);
});

export const createConnection = asyncHandler(async (req, res) => {
  const { service, accountIdentifier, credentials } = req.body;
  const userId = req.user._id;

  if (!service || !credentials) {
    throw ApiError.badRequest('Service and credentials are required');
  }

  const existingConnection = await Connection.findOne({
    userId,
    service,
    isActive: true
  });

  if (existingConnection) {
    throw ApiError.badRequest('Active connection already exists for this service');
  }

  const encryptedCredentials = EncryptionService.encryptObject(credentials);
  const iv = encryptedCredentials.split(':')[0]; // Extract IV from encrypted data

  const connection = await Connection.create({
    userId,
    service,
    accountIdentifier,
    encryptedCredentials,
    iv
  });

  const safeConnection = {
    _id: connection._id,
    service: connection.service,
    accountIdentifier: connection.accountIdentifier,
    isActive: connection.isActive,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt
  };

  logger.info('New connection created', {
    userId,
    service,
    connectionId: connection._id
  });

  return ApiResponse.created(
    { connection: safeConnection },
    'Connection created successfully'
  ).withRequest(req).send(res);
});

export const updateConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const { accountIdentifier, credentials } = req.body;
  const userId = req.user._id;

  const connection = await Connection.findOne({
    _id: connectionId,
    userId,
    isActive: true
  });

  if (!connection) {
    throw ApiError.notFound('Connection not found');
  }

  const updateData = {};

  if (accountIdentifier !== undefined) {
    updateData.accountIdentifier = accountIdentifier;
  }

  if (credentials) {
    const encryptedCredentials = EncryptionService.encryptObject(credentials);
    const iv = encryptedCredentials.split(':')[0];
    updateData.encryptedCredentials = encryptedCredentials;
    updateData.iv = iv;
  }

  updateData.lastUsedAt = new Date();

  const updatedConnection = await Connection.findByIdAndUpdate(
    connectionId,
    updateData,
    { new: true, runValidators: true }
  ).select('-encryptedCredentials -iv');

  logger.info('Connection updated', {
    userId,
    connectionId,
    service: updatedConnection.service
  });

  return ApiResponse.success(
    { connection: updatedConnection },
    'Connection updated successfully',
    200
  ).withRequest(req).send(res);
});


export const deleteConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user._id;

  const connection = await Connection.findOne({
    _id: connectionId,
    userId,
    isActive: true
  });

  if (!connection) {
    throw ApiError.notFound('Connection not found');
  }

  await Connection.findByIdAndUpdate(connectionId, {
    isActive: false,
    lastUsedAt: new Date()
  });

  logger.info('Connection deactivated', {
    userId,
    connectionId,
    service: connection.service
  });

  return ApiResponse.success(
    {},
    'Connection deleted successfully',
    200
  ).withRequest(req).send(res);
});

export const testConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user._id;

  const connection = await Connection.findOne({
    _id: connectionId,
    userId,
    isActive: true
  });

  if (!connection) {
    throw ApiError.notFound('Connection not found');
  }

  try {
    const credentials = EncryptionService.decryptObject(connection.encryptedCredentials);

    await Connection.findByIdAndUpdate(connectionId, {
      lastUsedAt: new Date()
    });

    logger.info('Connection test successful', {
      userId,
      connectionId,
      service: connection.service
    });

    return ApiResponse.success(
      { isValid: true },
      'Connection test successful',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Connection test failed', {
      userId,
      connectionId,
      service: connection.service,
      error: error.message
    });

    return ApiResponse.success(
      { isValid: false, error: 'Invalid or corrupted credentials' },
      'Connection test failed',
      200
    ).withRequest(req).send(res);
  }
});

export const getDecryptedCredentials = async (connectionId, userId) => {
  const connection = await Connection.findOne({
    _id: connectionId,
    userId,
    isActive: true
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  try {
    const credentials = EncryptionService.decryptObject(connection.encryptedCredentials);

    await Connection.findByIdAndUpdate(connectionId, {
      lastUsedAt: new Date()
    });

    return credentials;
  } catch (error) {
    logger.error('Failed to decrypt credentials', {
      connectionId,
      userId,
      service: connection.service,
      error: error.message
    });
    throw new Error('Failed to decrypt credentials');
  }
};
