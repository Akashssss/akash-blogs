import { Router } from 'express';
import { signup, signin, googleAuth, changePassword } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/google-auth', authLimiter, googleAuth);
router.post('/change-password', verifyJWT, changePassword);
router.post('/Change-password', verifyJWT, changePassword); // Legacy support

export default router;
