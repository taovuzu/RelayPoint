import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  handleIncomingWebhook,
  generateWebhookUrl,
  getWebhookTriggerInfo,
  testWebhookTrigger
} from '../controllers/webhook.trigger.controller.js';

const router = express.Router();

router.post('/trigger/:triggerId', handleIncomingWebhook);

router.use(verifyJWT);

router.get('/trigger/:triggerId/info', getWebhookTriggerInfo);
router.post('/trigger/:triggerId/test', testWebhookTrigger);
router.post('/relay/:relayId/generate-url', generateWebhookUrl);

export default router;
