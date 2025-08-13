import mongoose from 'mongoose';
import { Relay } from '../models/relay.model.js';
import { RelayRun } from '../models/relayRun.model.js';
import { RelayRunOutbox } from '../models/relayRunOutbox.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const handleWebhook = asyncHandler(async (req, res) => {
  const { userId, relayId } = req.params;
  const triggerMetadata = req.body;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: userId,
    active: true,
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found or is inactive');
  }

  const session = await mongoose.startSession();
  let newRelayRun;

  try {
    session.startTransaction();

    const relayRunToCreate = new RelayRun({
      relayId: relay._id,
      userId: userId,
      status: 'pending',
      triggerMetadata,
    });
    const savedRelayRun = await relayRunToCreate.save({ session });
    newRelayRun = savedRelayRun;

    const outboxToCreate = new RelayRunOutbox({
      relayRunId: newRelayRun._id,
      userId: userId,
      stage: 0,
      eventType: 'WORKFLOW_START',
      payload: {
        relayRunId: newRelayRun._id,
        userId: userId,
        triggeredAt: new Date().toISOString()
      },
      status: 'pending'
    });
    await outboxToCreate.save({ session });

    relay.runCount = (relay.runCount || 0) + 1;
    relay.lastRunAt = new Date();
    await relay.save({ session });

    await session.commitTransaction();

    return ApiResponse
      .success(
        { relayRunId: newRelayRun._id, relayName: relay.name },
        'Webhook processed and queued successfully'
      )
      .withRequest(req)
      .send(res);

  } catch (error) {
    await session.abortTransaction();
    console.error(`Webhook transaction failed for Relay ${relayId}:`, error);
    throw ApiError.internal('Failed to process webhook due to a server error.');
  } finally {
    session.endSession();
  }
});

export const getWebhookUrl = asyncHandler(async (req, res) => {
  const { relayId } = req.params;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  if (relay.trigger.triggerId !== 'INCOMING_WEBHOOK') {
    throw ApiError.badRequest('This relay is not a webhook trigger');
  }

  return ApiResponse
    .success(
      {
        webhookUrl: relay.webhookUrl,
        relayName: relay.name
      },
      'Webhook URL fetched successfully'
    )
    .withRequest(req)
    .send(res);
});

export const regenerateWebhookUrl = asyncHandler(async (req, res) => {
  const { relayId } = req.params;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  if (relay.trigger.triggerId !== 'INCOMING_WEBHOOK') {
    throw ApiError.badRequest('This relay is not a webhook trigger');
  }

  relay.webhookUrl = `${process.env.BACKEND_URL}/api/hooks/catch/${relay.userId}/${relay._id}`;
  await relay.save();

  return ApiResponse
    .success(
      {
        webhookUrl: relay.webhookUrl
      },
      'Webhook URL regenerated successfully'
    )
    .withRequest(req)
    .send(res);
});


