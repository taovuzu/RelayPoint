import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  connectSolanaWallet,
  getSolanaConnectionStatus,
  disconnectSolana,
  testSolanaConnection
} from '../controllers/solana.connection.controller.js';
import {
  getBalance,
  sendSol,
  getTransaction,
  getAccountInfo,
  getNetworkInfo,
  testConnection,
  validateAddress
} from '../controllers/solana.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/connect', connectSolanaWallet);
router.get('/status', getSolanaConnectionStatus);
router.delete('/disconnect', disconnectSolana);
router.post('/test-connection', testSolanaConnection);

router.get('/balance', getBalance);
router.post('/send', sendSol);
router.get('/transaction/:signature', getTransaction);
router.get('/account', getAccountInfo);
router.get('/network', getNetworkInfo);
router.post('/test', testConnection);
router.post('/validate-address', validateAddress);

export default router;
