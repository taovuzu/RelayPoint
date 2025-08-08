import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { suggestRelay } from '../controllers/suggester.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/suggest', suggestRelay);

export default router;
