import { Router } from 'express';
import authRoutes from './auth.routes.js';
import blogRoutes from './blog.routes.js';
import commentRoutes from './comment.routes.js';
import notificationRoutes from './notification.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// Mount all modular routes
router.use(authRoutes);
router.use(blogRoutes);
router.use(commentRoutes);
router.use(notificationRoutes);
router.use(userRoutes);
router.use(uploadRoutes);
router.use(analyticsRoutes);

export default router;
