import prisma from '#db/index.db.js';
import { ApiError } from '#util/ApiError.js';
import { v4 as uuidv4 } from 'uuid';
import { TRIGGER_TYPES, ACTION_TYPES } from '#constant.js';
import { findTriggerByKey, findActionByKey } from '#apps/app-loader.js';
import { createGlobalVariable } from '#apps/global-variable.js';
import logger from '#util/logger.js';

import envConfig from '#config/env.config.js';

export const createWorkflow = async (userId, workflowData) => {
  const { name, description = null, trigger, actions } = workflowData;

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  const triggerDefInfo = findTriggerByKey(trigger.id);
  if (!triggerDefInfo) {
    throw ApiError.badRequest(`Invalid trigger type: ${trigger.id}`);
  }

  for (const action of sortedActions) {
    if (!findActionByKey(action.id)) {
      throw ApiError.badRequest(`Invalid action type: ${action.id}`);
    }
  }

  const webhookUrl = triggerDefInfo.trigger.type === 'webhook' ? uuidv4() : null;

  const workflow = await prisma.relay.create({
    data: {
      userId,
      name,
      description,
      trigger, 
      actions: sortedActions,
      webhookUrl,
      active: false,
    },
  });

  return workflow;
};

export const getWorkflows = async (userId, { page = 1, limit = 10 } = {}) => {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const skip = (p - 1) * l;

  const [workflows, total] = await Promise.all([
    prisma.relay.findMany({
      where: { userId },
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.relay.count({ where: { userId } }),
  ]);

  return {
    workflows,
    total,
    page: p,
    totalPages: Math.ceil(total / l),
  };
};


export const getWorkflowById = async (userId, workflowId) => {
  const relay = await prisma.relay.findFirst({
    where: {
      id: workflowId,
      userId,
    },
    include: {
      relayRuns: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          currentStage: true,
          triggerMetadata: true,
          executionHistory: true,
          totalDuration: true,
          startedAt: true,
          completedAt: true,
          errorMessage: true,
        },
      },
    },
  });

  if (!relay) {
    throw ApiError.notFound('Workflow not found');
  }

  return relay;
};


export const updateWorkflow = async (userId, workflowId, workflowData) => {
  const { name, description, trigger, actions, active } = workflowData;

  const existing = await prisma.relay.findFirst({
    where: { id: workflowId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Workflow not found');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (active !== undefined) updateData.active = active;

  if (trigger) {
    const triggerDefInfo = findTriggerByKey(trigger.id);
    if (!triggerDefInfo) {
      throw ApiError.badRequest(`Invalid trigger type: ${trigger.id}`);
    }
    updateData.trigger = trigger;

    if (triggerDefInfo.trigger.type === 'webhook' && !existing.webhookUrl) {
      updateData.webhookUrl = uuidv4();
    } else if (triggerDefInfo.trigger.type !== 'webhook' && existing.webhookUrl) {
      updateData.webhookUrl = null;
    }
  }

  if (actions) {
    const sortedActions = [...actions].sort((a, b) => a.order - b.order);
    for (const action of sortedActions) {
      if (!findActionByKey(action.id)) {
        throw ApiError.badRequest(`Invalid action type: ${action.id}`);
      }
    }
    updateData.actions = sortedActions;
  }

  const updatedWorkflow = await prisma.relay.update({
    where: { id: workflowId },
    data: updateData,
  });

  return updatedWorkflow;
};

export const deleteWorkflow = async (userId, workflowId) => {
  const existing = await prisma.relay.findFirst({
    where: { id: workflowId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Workflow not found');
  }

  await prisma.relay.delete({
    where: { id: workflowId },
  });

  return { message: 'Workflow deleted successfully' };
};

export const toggleWorkflow = async (userId, workflowId) => {
  const existing = await prisma.relay.findFirst({
    where: { id: workflowId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Workflow not found');
  }

  const newState = !existing.active;
  const triggerDefInfo = findTriggerByKey(existing.trigger.id);
  
  if (triggerDefInfo && triggerDefInfo.trigger) {
    const { app, trigger } = triggerDefInfo;
    const $ = await createGlobalVariable({
      app,
      userId,
      stepParameters: existing.trigger.config || {},
      workflowId: existing.id,
      webhookUrl: `${envConfig.APP_URL}/hooks/triggers/${existing.webhookUrl}`,
    });

    try {
      if (newState) {
        if (trigger.registerHook) await trigger.registerHook($);
      } else {
        if (trigger.unregisterHook) await trigger.unregisterHook($);
      }
    } catch (err) {
      const errorDetail = err.response?.data?.message || err.response?.data?.error || err.message;
      logger.error(`Failed to ${newState ? 'register' : 'unregister'} trigger hook: ${errorDetail}`, { workflowId, error: err.response?.data });
      throw ApiError.internal(`Failed to ${newState ? 'activate' : 'deactivate'} workflow: ${errorDetail}`);
    }
  }

  const updated = await prisma.relay.update({
    where: { id: workflowId },
    data: { active: newState },
  });

  return updated;
};

// ref: https://www.prisma.io/docs/orm/prisma-client/queries/crud
// ref: https://www.prisma.io/docs/orm/reference/prisma-client-reference#groupby
