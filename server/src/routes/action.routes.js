import { Router } from 'express';
import { getAvailableActions, getActionById } from '../controllers/action.controller.js';

const router = Router();

router.get('/available', getAvailableActions);
router.get('/:actionId', getActionById);

export default router;
