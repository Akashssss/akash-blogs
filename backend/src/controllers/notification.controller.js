import Notification from '../models/Notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNewNotificationStatus = asyncHandler(async (req, res) => {
    const userId = req.user;

    const exists = await Notification.exists({
        notification_for: userId,
        seen: false,
        user: { $ne: userId }
    });

    return res.status(200).json({ new_notification_available: Boolean(exists) });
});

export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { page = 1, filter = 'all', deletedDocCount = 0 } = { ...req.query, ...req.body };
    const maxLimit = 10;
    let skipDocs = (parseInt(page, 10) - 1) * maxLimit;

    if (deletedDocCount) {
        skipDocs = Math.max(0, skipDocs - parseInt(deletedDocCount, 10));
    }

    const findQuery = { notification_for: userId, user: { $ne: userId } };
    if (filter !== 'all') {
        findQuery.type = filter;
    }

    const notifications = await Notification.find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate('blog', 'title blog_id')
        .populate('user', 'personal_info.fullname personal_info.username personal_info.profile_img')
        .populate('comment', 'comment')
        .populate('replied_on_comment', 'comment')
        .populate('reply', 'comment')
        .sort({ createdAt: -1 })
        .select('createdAt type seen reply');

    // Mark as seen
    await Notification.updateMany(findQuery, { seen: true }).skip(skipDocs).limit(maxLimit);

    return res.status(200).json({ notifications });
});

export const getAllNotificationsCount = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { filter = 'all' } = { ...req.query, ...req.body };

    const findQuery = { notification_for: userId, user: { $ne: userId } };
    if (filter !== 'all') {
        findQuery.type = filter;
    }

    const count = await Notification.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: count });
});
