import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  handleGmailPushNotification,
  testGmailConnection
} from '../controllers/gmail.webhook.controller.js';

const router = express.Router();

router.post('/webhook', handleGmailPushNotification);

router.use(verifyJWT);
router.post('/test', testGmailConnection);

export default router;
