import { Router } from 'express';
import { handleNangoAuthWebhook } from './nango.webhook.controller.js';

const router = Router();

router.post('/', handleNangoAuthWebhook);

export default router;

