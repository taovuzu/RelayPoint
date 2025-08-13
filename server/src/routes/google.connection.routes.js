import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  redirectToGoogleAuth,
  handleGoogleCallback,
  getGoogleConnectionStatus,
  disconnectGoogle
} from '../controllers/google.connection.controller.js';

const router = express.Router();

router.get('/callback', handleGoogleCallback);

router.use(verifyJWT);

router.get('/auth', redirectToGoogleAuth);
router.get('/status', getGoogleConnectionStatus);
router.delete('/disconnect', disconnectGoogle);

export default router;
