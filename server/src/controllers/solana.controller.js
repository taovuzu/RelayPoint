import { SolanaService } from '../services/solana.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const getBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const balance = await SolanaService.getBalance(userId);

    return ApiResponse.success(
      { balance },
      'Balance retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get Solana balance', {
      userId,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get balance: ${error.message}`);
  }
});

export const sendSol = asyncHandler(async (req, res) => {
  const { recipient, amount } = req.body;
  const userId = req.user._id;

  if (!recipient || !amount) {
    throw ApiError.badRequest('Recipient and amount are required');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw ApiError.badRequest('Amount must be a positive number');
  }

  if (!SolanaService.isValidAddress(recipient)) {
    throw ApiError.badRequest('Invalid recipient address');
  }

  try {
    const result = await SolanaService.sendSol(userId, { recipient, amount });

    logger.info('SOL sent via API', {
      userId,
      recipient,
      amount,
      signature: result.signature
    });

    return ApiResponse.success(
      { result },
      'SOL sent successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to send SOL', {
      userId,
      recipient,
      amount,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to send SOL: ${error.message}`);
  }
});

export const getTransaction = asyncHandler(async (req, res) => {
  const { signature } = req.params;

  if (!signature) {
    throw ApiError.badRequest('Transaction signature is required');
  }

  try {
    const transaction = await SolanaService.getTransaction(signature);

    return ApiResponse.success(
      { transaction },
      'Transaction details retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get transaction', {
      signature,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get transaction: ${error.message}`);
  }
});

export const getAccountInfo = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const accountInfo = await SolanaService.getAccountInfo(userId);

    return ApiResponse.success(
      { accountInfo },
      'Account information retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get account info', {
      userId,
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get account info: ${error.message}`);
  }
});

export const getNetworkInfo = asyncHandler(async (req, res) => {
  try {
    const networkInfo = await SolanaService.getNetworkInfo();

    return ApiResponse.success(
      { networkInfo },
      'Network information retrieved successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Failed to get network info', {
      error: error.message
    });

    throw ApiError.badRequest(`Failed to get network info: ${error.message}`);
  }
});

export const testConnection = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const result = await SolanaService.testConnection(userId);

    return ApiResponse.success(
      result,
      result.isValid ? 'Solana connection test successful' : 'Solana connection test failed',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Solana connection test error', {
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

export const validateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    throw ApiError.badRequest('Address is required');
  }

  const isValid = SolanaService.isValidAddress(address);

  return ApiResponse.success(
    {
      address,
      isValid
    },
    `Address is ${isValid ? 'valid' : 'invalid'}`,
    200
  ).withRequest(req).send(res);
});
