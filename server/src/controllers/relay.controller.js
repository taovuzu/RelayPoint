import { Relay } from '../models/relay.model.js';
import { RelayRun } from '../models/relayRun.model.js';
import { AVAILABLE_ACTIONS, AVAILABLE_TRIGGERS, AVAILABLE_ACTION_TYPES, AVAILABLE_TRIGGER_TYPES } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const createRelay = asyncHandler(async (req, res) => {
  const { name, description, trigger, actions } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  let normalizedTrigger;
  if (typeof trigger === 'string') {
    const triggerId = trigger;
    if (!AVAILABLE_TRIGGER_TYPES.includes(triggerId)) {
      throw ApiError.badRequest('Invalid trigger type');
    }
    normalizedTrigger = {
      triggerId,
      name: AVAILABLE_TRIGGERS[triggerId]?.name || triggerId,
      config: {}
    };
  } else if (trigger && typeof trigger === 'object') {
    const triggerId = trigger.triggerId || trigger.type;
    if (!triggerId || !AVAILABLE_TRIGGER_TYPES.includes(triggerId)) {
      throw ApiError.badRequest('Invalid or missing trigger type');
    }
    normalizedTrigger = {
      triggerId,
      name: trigger.name || AVAILABLE_TRIGGERS[triggerId]?.name || triggerId,
      config: trigger.config || {}
    };
  } else {
    throw ApiError.badRequest('Trigger is required');
  }

  let normalizedActions = Array.isArray(actions) ? actions.slice() : [];
  normalizedActions = normalizedActions
    .map((a, idx) => {
      const actionId = a.actionId || a.type;
      const order = typeof a.order === 'number' ? a.order : idx;
      const config = a.config || a.details || {};
      if (!actionId || !AVAILABLE_ACTION_TYPES.includes(actionId)) {
        throw ApiError.badRequest('Invalid action type in actions list');
      }
      return {
        actionId,
        name: a.name || AVAILABLE_ACTIONS[actionId]?.name || actionId,
        order,
        config
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((a, idx) => ({ ...a, order: idx }));

  const relay = await Relay.create({
    userId: req.user._id,
    name,
    description,
    trigger: normalizedTrigger,
    actions: normalizedActions
  });

  return ApiResponse.created({ relay }, 'Relay created successfully').withRequest(req).send(res);
});

export const getUserRelays = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, active } = req.query;
  const query = { userId: req.user._id };

  if (active !== undefined) {
    query.active = active === 'true';
  }

  const relays = await Relay.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Relay.countDocuments(query);

  return ApiResponse.success({
    relays,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  }, 'Relays fetched successfully', 200).withRequest(req).send(res);
});

export const getRelay = asyncHandler(async (req, res) => {
  const { relayId } = req.params;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  return ApiResponse.success({ relay }, 'Relay fetched successfully', 200).withRequest(req).send(res);
});

export const updateRelay = asyncHandler(async (req, res) => {
  const { relayId } = req.params;
  const updateData = req.body;

  delete updateData.userId;
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const relay = await Relay.findOneAndUpdate(
    { _id: relayId, userId: req.user._id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  return ApiResponse.success({ relay }, 'Relay updated successfully', 200).withRequest(req).send(res);
});

export const deleteRelay = asyncHandler(async (req, res) => {
  const { relayId } = req.params;

  const relay = await Relay.findOneAndDelete({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  await RelayRun.deleteMany({ relayId });

  return ApiResponse.success({}, 'Relay deleted successfully', 200).withRequest(req).send(res);
});

export const toggleRelay = asyncHandler(async (req, res) => {
  const { relayId } = req.params;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  relay.active = !relay.active;
  await relay.save();

  return ApiResponse.success({ relay }, `Relay ${relay.active ? 'activated' : 'deactivated'} successfully`, 200).withRequest(req).send(res);
});

export const getRelayRuns = asyncHandler(async (req, res) => {
  const { relayId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  const query = { relayId };
  if (status) {
    query.status = status;
  }

  const runs = await RelayRun.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await RelayRun.countDocuments(query);

  return ApiResponse.success({
    runs,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  }, 'Relay runs fetched successfully', 200).withRequest(req).send(res);
});

export const testRelay = asyncHandler(async (req, res) => {
  const { relayId } = req.params;
  const testData = req.body || {};

  const relay = await Relay.findOne({
    _id: relayId,
    userId: req.user._id
  });

  if (!relay) {
    throw ApiError.notFound('Relay not found');
  }

  const relayRun = await RelayRun.create({
    relayId: relay._id,
    userId: req.user._id,
    status: 'pending',
    triggerMetadata: testData
  });

  return ApiResponse.success({
    relayRunId: relayRun._id,
    message: 'Test relay run created. Use webhook trigger for execution in Kafka-based system.'
  }, 'Relay test initiated successfully', 200).withRequest(req).send(res);
});


