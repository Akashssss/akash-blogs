import Comment from '../models/Comment.model.js';
import Blog from '../models/Blog.model.js';
import Notification from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addComment = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { _id, comment, replying_to, blog_author, notification_id } = req.body;

    if (!comment || !comment.trim().length) {
        throw new ApiError(400, 'Comment text cannot be empty.');
    }

    const commentObj = {
        blog_id: _id,
        blog_author,
        comment: comment.trim(),
        commented_by: userId,
    };

    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    const savedComment = await new Comment(commentObj).save();
    const { commentedAt, children } = savedComment;

    // Update blog comments count
    await Blog.findByIdAndUpdate(_id, {
        $push: { comments: savedComment._id },
        $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1
        }
    });

    // Create Notification
    const notificationObj = new Notification({
        type: replying_to ? "reply" : "comment",
        blog: _id,
        notification_for: blog_author,
        user: userId,
        comment: savedComment._id,
    });

    if (replying_to) {
        notificationObj.replied_on_comment = replying_to;
        const parentComment = await Comment.findByIdAndUpdate(
            replying_to,
            { $push: { children: savedComment._id } },
            { new: true }
        );
        if (parentComment) {
            notificationObj.notification_for = parentComment.commented_by;
        }

        if (notification_id) {
            await Notification.findByIdAndUpdate(notification_id, { reply: savedComment._id });
        }
    }

    await notificationObj.save();

    return res.status(200).json({
        comment: savedComment.comment,
        commentedAt,
        _id: savedComment._id,
        user_id: userId,
        children
    });
});

export const getBlogComments = asyncHandler(async (req, res) => {
    const { blog_id, skip = 0 } = { ...req.query, ...req.body };
    const maxLimit = 5;

    const comments = await Comment.find({ blog_id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.profile_img personal_info.fullname")
        .skip(parseInt(skip, 10))
        .limit(maxLimit)
        .sort({ commentedAt: -1 });

    return res.status(200).json(comments);
});

export const getReplies = asyncHandler(async (req, res) => {
    const { _id, skip = 0 } = { ...req.query, ...req.body };
    const maxLimit = 5;

    const doc = await Comment.findById(_id)
        .populate({
            path: 'children',
            options: {
                limit: maxLimit,
                skip: parseInt(skip, 10),
                sort: { commentedAt: -1 }
            },
            populate: {
                path: 'commented_by',
                select: 'personal_info.profile_img personal_info.fullname personal_info.username'
            },
            select: '-blog_id -updatedAt'
        })
        .select('children');

    return res.status(200).json({ replies: doc ? doc.children : [] });
});

const recursiveDelete = async (commentId) => {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) return;

    if (comment.parent) {
        await Comment.findByIdAndUpdate(comment.parent, {
            $pull: { children: commentId }
        });
    }

    await Promise.all([
        Notification.findOneAndDelete({ comment: commentId }),
        Notification.findOneAndUpdate({ reply: commentId }, { $unset: { reply: 1 } }),
        Blog.findByIdAndUpdate(comment.blog_id, {
            $pull: { comments: commentId },
            $inc: {
                "activity.total_comments": -1,
                "activity.total_parent_comments": comment.parent ? 0 : -1
            }
        })
    ]);

    if (comment.children && comment.children.length) {
        for (const childId of comment.children) {
            await recursiveDelete(childId);
        }
    }
};

export const deleteComment = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { _id } = req.body;

    const comment = await Comment.findById(_id);
    if (!comment) throw new ApiError(404, 'Comment not found.');

    if (userId !== comment.commented_by.toString() && userId !== comment.blog_author.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this comment.');
    }

    await recursiveDelete(_id);
    return res.status(200).json({ status: 'done' });
});
