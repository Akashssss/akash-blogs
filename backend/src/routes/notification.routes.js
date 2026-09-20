import { Router } from 'express';
import {
    getNewNotificationStatus,
    getNotifications,
    getAllNotificationsCount
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/new-notiification', verifyJWT, getNewNotificationStatus);
router.get('/new-notification', verifyJWT, getNewNotificationStatus); // Fixed typo alias

router.route('/notifications').get(verifyJWT, getNotifications).post(verifyJWT, getNotifications);
router.route('/all-notifications-count').get(verifyJWT, getAllNotificationsCount).post(verifyJWT, getAllNotificationsCount);

export default router;
