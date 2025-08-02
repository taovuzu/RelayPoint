import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createRelay,
  getUserRelays,
  getRelay,
  updateRelay,
  deleteRelay,
  toggleRelay,
  getRelayRuns,
  testRelay
} from '../controllers/relay.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/', createRelay);
router.get('/', getUserRelays);
router.get('/:relayId', getRelay);
router.put('/:relayId', updateRelay);
router.delete('/:relayId', deleteRelay);
router.patch('/:relayId/toggle', toggleRelay);

router.get('/:relayId/runs', getRelayRuns);
router.post('/:relayId/test', testRelay);

export default router;
