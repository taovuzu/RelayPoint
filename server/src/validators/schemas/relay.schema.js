import { z } from 'zod';
import { AVAILABLE_ACTION_TYPES, AVAILABLE_TRIGGER_TYPES } from '../../constants.js';

export const createRelaySchema = z.object({
  name: z.string().min(3, 'Relay name must be at least 3 characters long'),
  description: z.string().optional(),
  trigger: z.object({
    triggerId: z.enum(AVAILABLE_TRIGGER_TYPES, { 
      required_error: 'A valid triggerId is required' 
    }),
    config: z.record(z.any()).optional().default({}),
    name: z.string().min(1, 'Trigger name is required')
  }),
  actions: z.array(z.object({
    actionId: z.enum(AVAILABLE_ACTION_TYPES, { 
      required_error: 'A valid actionId is required' 
    }),
    order: z.number().int().min(0, 'Order must be a non-negative integer'),
    config: z.record(z.any()).optional().default({}),
    name: z.string().min(1, 'Action name is required')
  })).min(1, 'At least one action is required'),
});

export const updateRelaySchema = z.object({
  name: z.string().min(3, 'Relay name must be at least 3 characters long').optional(),
  description: z.string().optional(),
  trigger: z.object({
    triggerId: z.enum(AVAILABLE_TRIGGER_TYPES, { 
      required_error: 'A valid triggerId is required' 
    }),
    config: z.record(z.any()).optional().default({}),
    name: z.string().min(1, 'Trigger name is required')
  }).optional(),
  actions: z.array(z.object({
    actionId: z.enum(AVAILABLE_ACTION_TYPES, { 
      required_error: 'A valid actionId is required' 
    }),
    order: z.number().int().min(0, 'Order must be a non-negative integer'),
    config: z.record(z.any()).optional().default({}),
    name: z.string().min(1, 'Action name is required')
  })).min(1, 'At least one action is required').optional(),
  active: z.boolean().optional()
});
