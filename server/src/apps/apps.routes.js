import { Router } from 'express';
import { verifyJWT } from '#middleware/auth.middleware.js';
import * as appsController from '#apps/apps.controller.js';

const router = Router();

router.use(verifyJWT);

router.get('/', appsController.listApps);
router.get('/:appKey', appsController.getApp);
router.post('/dynamic-data/:appKey', appsController.getDynamicData);
router.post('/:appKey/test-trigger', appsController.testTrigger);
router.post('/:appKey/test-action', appsController.testAction);

export default router;
