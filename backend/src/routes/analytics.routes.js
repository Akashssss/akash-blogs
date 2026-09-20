import { Router } from 'express';
import { getAuthorAnalytics } from '../controllers/analytics.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/api/v2/analytics').get(verifyJWT, getAuthorAnalytics);
router.route('/author-analytics').get(verifyJWT, getAuthorAnalytics).post(verifyJWT, getAuthorAnalytics);

export default router;
