import express from 'express';
import { verifyJWT, getUserLoggedInOrNot } from '../middlewares/auth.middleware.js';
import {
  handleWebhook,
  getWebhookUrl,
  regenerateWebhookUrl
} from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/catch/:userId/:relayId', handleWebhook);

router.use(verifyJWT);
router.get('/url/:relayId', getWebhookUrl);
router.post('/regenerate/:relayId', regenerateWebhookUrl);

export default router;
