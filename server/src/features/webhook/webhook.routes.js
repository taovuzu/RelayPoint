import { Router } from 'express';
import { handleWebhook } from './webhook.controller.js';

const router = Router();

router.post('/:triggerId', handleWebhook);

export default router;

