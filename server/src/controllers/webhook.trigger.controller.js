import { Relay } from '../models/relay.model.js';
import { RelayRun } from '../models/relayRun.model.js';
import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

export const handleIncomingWebhook = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;
  const webhookData = {
    body: req.body,
    headers: req.headers,
    query: req.query,
    method: req.method,
    ip: req.ip,
    timestamp: new Date()
  };

  try {
    const relay = await Relay.findOne({
      'trigger.config.triggerId': triggerId,
      active: true
    }).populate('userId', 'email');

    if (!relay) {
      logger.warn('Webhook trigger not found or inactive', {
        triggerId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(404).json({
        success: false,
        message: 'Webhook trigger not found or inactive'
      });
    }

    if (relay.trigger.config.secret) {
      const isValidSignature = validateWebhookSignature(
        req,
        relay.trigger.config.secret
      );

      if (!isValidSignature) {
        logger.warn('Invalid webhook signature', {
          triggerId,
          relayId: relay._id,
          ip: req.ip
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    const relayRun = await RelayRun.create({
      relayId: relay._id,
      userId: relay.userId._id,
      status: 'pending',
      triggerMetadata: {
        type: 'WEBHOOK_RECEIVED',
        triggerId,
        webhookData
      }
    });

    await RelayRunOutbox.create({
      relayRunId: relayRun._id,
      userId: relay.userId._id,
      stage: 0,
      eventType: 'STAGE_EXECUTION',
      payload: {
        triggerData: {
          type: 'WEBHOOK_RECEIVED',
          triggerId,
          webhookData
        },
        relayConfig: relay
      },
      status: 'pending'
    });

    await Relay.findByIdAndUpdate(relay._id, {
      lastRunAt: new Date(),
      $inc: { runCount: 1 }
    });

    logger.info('Webhook received and queued for execution', {
      triggerId,
      relayId: relay._id,
      relayRunId: relayRun._id,
      userId: relay.userId._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      relayRunId: relayRun._id
    });

  } catch (error) {
    logger.error('Webhook processing error', {
      triggerId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

function validateWebhookSignature(req, secret) {
  try {
    const signature = req.get('X-Hub-Signature-256') || req.get('X-Signature');

    if (!signature) {
      return false;
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  } catch (error) {
    logger.error('Webhook signature validation error', {
      error: error.message
    });
    return false;
  }
}

export const generateWebhookUrl = asyncHandler(async (req, res) => {
  const { relayId } = req.params;
  const userId = req.user._id;

  const relay = await Relay.findOne({
    _id: relayId,
    userId,
    active: true
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  let triggerId = relay.trigger.config?.triggerId;

  if (!triggerId) {
    triggerId = crypto.randomBytes(16).toString('hex');

    await Relay.findByIdAndUpdate(relayId, {
      'trigger.config.triggerId': triggerId
    });
  }

  const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/v1/webhooks/trigger/${triggerId}`;

  logger.info('Webhook URL generated', {
    relayId,
    userId,
    triggerId,
    webhookUrl
  });

  return ApiResponse.success(
    {
      webhookUrl,
      triggerId,
      relayId
    },
    'Webhook URL generated successfully',
    200
  ).withRequest(req).send(res);
});

export const getWebhookTriggerInfo = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;
  const userId = req.user._id;

  const relay = await Relay.findOne({
    'trigger.config.triggerId': triggerId,
    userId,
    active: true
  });

  if (!relay) {
    throw ApiError.notFound('Webhook trigger not found');
  }

  const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/v1/webhooks/trigger/${triggerId}`;

  return ApiResponse.success(
    {
      relayId: relay._id,
      relayName: relay.name,
      webhookUrl,
      triggerId,
      isActive: relay.active,
      lastRunAt: relay.lastRunAt,
      runCount: relay.runCount
    },
    'Webhook trigger information retrieved successfully',
    200
  ).withRequest(req).send(res);
});

export const testWebhookTrigger = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;
  const testData = req.body;

  try {
    const mockReq = {
      params: { triggerId },
      body: testData,
      headers: req.headers,
      query: {},
      method: 'POST',
      ip: req.ip,
      get: (header) => req.get(header)
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          logger.info('Webhook test completed', {
            triggerId,
            statusCode: code,
            response: data
          });
          return data;
        }
      })
    };

    await handleIncomingWebhook(mockReq, mockRes);

    return ApiResponse.success(
      { success: true },
      'Webhook test completed successfully',
      200
    ).withRequest(req).send(res);

  } catch (error) {
    logger.error('Webhook test failed', {
      triggerId,
      error: error.message
    });

    return ApiResponse.success(
      { success: false, error: error.message },
      'Webhook test failed',
      200
    ).withRequest(req).send(res);
  }
});
