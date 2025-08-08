import { Router } from 'express';
import { getAvailableTriggers, getTriggerById } from '../controllers/trigger.controller.js';

const router = Router();

router.get('/available', getAvailableTriggers);
router.get('/:triggerId', getTriggerById);

export default router;
