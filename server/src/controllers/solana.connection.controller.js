import { Keypair } from '@solana/web3.js';
import { Connection } from '../models/connection.model.js';
import { EncryptionService } from '../services/encryption.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const connectSolanaWallet = asyncHandler(async (req, res) => {
  const { privateKey } = req.body;
  const userId = req.user._id;

  if (!privateKey) {
    throw ApiError.badRequest('Private key is required');
  }

  try {
    let keypair;
    try {
      const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'base64'));
      keypair = Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      try {
        const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'hex'));
        keypair = Keypair.fromSecretKey(privateKeyBytes);
      } catch (hexError) {
        throw new Error('Invalid private key format. Please provide base64 or hex encoded private key.');
      }
    }

    const publicKey = keypair.publicKey.toString();

    const existingConnection = await Connection.findOne({
      userId,
      service: 'solana',
      isActive: true
    });

    if (existingConnection) {
      const encryptedCredentials = EncryptionService.encryptObject({ privateKey });
      const iv = encryptedCredentials.split(':')[0];

      await Connection.findByIdAndUpdate(existingConnection._id, {
        accountIdentifier: publicKey,
        encryptedCredentials,
        iv,
        lastUsedAt: new Date()
      });

      logger.info('Solana wallet connection updated', {
        userId,
        connectionId: existingConnection._id,
        publicKey
      });

      return ApiResponse.success(
        {
          connectionId: existingConnection._id,
          publicKey,
          message: 'Solana wallet connection updated successfully'
        },
        'Solana wallet connection updated successfully',
        200
      ).withRequest(req).send(res);
    }

    const encryptedCredentials = EncryptionService.encryptObject({ privateKey });
    const iv = encryptedCredentials.split(':')[0];

    const connection = await Connection.create({
      userId,
      service: 'solana',
      accountIdentifier: publicKey,
      encryptedCredentials,
      iv
    });

    logger.info('Solana wallet connected successfully', {
      userId,
      connectionId: connection._id,
      publicKey
    });

    return ApiResponse.created(
      {
        connectionId: connection._id,
        publicKey,
        message: 'Solana wallet connected successfully'
      },
      'Solana wallet connected successfully'
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to connect Solana wallet', {
      userId,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to connect Solana wallet: ${error.message}`);
  }
});

export const getSolanaConnectionStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connection = await Connection.findOne({
    userId,
    service: 'solana',
    isActive: true
  }).select('-encryptedCredentials -iv');

  if (!connection) {
    return ApiResponse.success(
      { connected: false },
      'No Solana connection found',
      200
    ).withRequest(req).send(res);
  }

  return ApiResponse.success(
    {
      connected: true,
      connection: {
        _id: connection._id,
        accountIdentifier: connection.accountIdentifier,
        createdAt: connection.createdAt,
        lastUsedAt: connection.lastUsedAt
      }
    },
    'Solana connection found',
    200
  ).withRequest(req).send(res);
});

export const disconnectSolana = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connection = await Connection.findOne({
    userId,
    service: 'solana',
    isActive: true
  });

  if (!connection) {
    throw ApiError.notFound('Solana connection not found');
  }

  await Connection.findByIdAndUpdate(connection._id, {
    isActive: false,
    lastUsedAt: new Date()
  });

  logger.info('Solana wallet disconnected', {
    userId,
    connectionId: connection._id,
    publicKey: connection.accountIdentifier
  });

  return ApiResponse.success(
    {},
    'Solana wallet disconnected successfully',
    200
  ).withRequest(req).send(res);
});

export const testSolanaConnection = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const connection = await Connection.findOne({
      userId,
      service: 'solana',
      isActive: true
    });

    if (!connection) {
      return ApiResponse.success(
        { isValid: false, error: 'No Solana connection found' },
        'Solana connection test failed',
        200
      ).withRequest(req).send(res);
    }

    const credentials = EncryptionService.decryptObject(connection.encryptedCredentials);
    const privateKey = credentials.privateKey;

    const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'base64'));
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    const publicKey = keypair.publicKey.toString();

    if (publicKey !== connection.accountIdentifier) {
      throw new Error('Private key does not match stored public key');
    }

    return ApiResponse.success(
      {
        isValid: true,
        publicKey,
        message: 'Solana connection is valid'
      },
      'Solana connection test successful',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Solana connection test failed', {
      userId,
      error: error.message
    });

    return ApiResponse.success(
      {
        isValid: false,
        error: error.message
      },
      'Solana connection test failed',
      200
    ).withRequest(req).send(res);
  }
});
