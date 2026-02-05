import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validateCreateWorkflow, validateUpdateWorkflow } from './workflow.validator.js';
import { createWorkflow, getWorkflows, getWorkflowById, updateWorkflow, deleteWorkflow, toggleWorkflow } from './workflow.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/', validateCreateWorkflow, createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflowById);
router.patch('/:id', validateUpdateWorkflow, updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.patch('/:id/toggle', toggleWorkflow);

export default router;

