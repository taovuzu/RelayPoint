import { Router } from 'express';
import { verifyJWT } from '#middleware/auth.middleware.js';
import { validateCreateConnection } from './connection.validator.js';
import { createConnection, getConnections, getConnectionById, deleteConnection, getSessionToken } from './connection.controller.js';

const router = Router();

router.use(verifyJWT);
router.post('/session-token', getSessionToken);
router.post('/', validateCreateConnection, createConnection);
router.get('/', getConnections);
router.get('/:id', getConnectionById);
router.delete('/:id', deleteConnection);

export default router;
