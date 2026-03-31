import { z } from 'zod';

export const workflowNameSchema = z.object({
  name: z.string().trim().min(3, 'Workflow name must be at least 3 characters.').max(100, 'Max 100 characters.'),
  description: z.string().max(500).optional()
});


export const workflowPayloadSchema = z.object({
  name: z.string().trim().min(3, 'Name is required (min 3 chars).').max(100),
  trigger: z.object({
    id: z.string().min(1, 'A trigger node is required to start the workflow.'),
    config: z.record(z.any()).optional()
  }).nullable()
  .refine((val) => val !== null, { message: "A trigger node is required to start the workflow." }),
  actions: z.array(z.object({
    id: z.string().min(1, 'Action ID is required.'),
    order: z.number().min(0),
    config: z.record(z.any()).optional()
  })).min(1, 'At least one action step is required to save.')
});
