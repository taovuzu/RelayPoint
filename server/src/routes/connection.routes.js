import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getUserConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection
} from '../controllers/connection.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getUserConnections);
router.get('/:connectionId', getConnection);
router.post('/', createConnection);
router.put('/:connectionId', updateConnection);
router.delete('/:connectionId', deleteConnection);
router.post('/:connectionId/test', testConnection);

export default router;
