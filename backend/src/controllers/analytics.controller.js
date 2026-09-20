import Blog from '../models/Blog.model.js';
import User from '../models/User.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAuthorAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user;

    const [user, blogs] = await Promise.all([
        User.findById(userId).select('account_info personal_info'),
        Blog.find({ author: userId }).select('title blog_id activity publishedAt draft read_time')
    ]);

    let totalReads = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let publishedCount = 0;
    let draftCount = 0;

    const blogPerformance = [];

    blogs.forEach((b) => {
        if (b.draft) {
            draftCount++;
        } else {
            publishedCount++;
            totalReads += b.activity.total_reads || 0;
            totalLikes += b.activity.total_likes || 0;
            totalComments += b.activity.total_comments || 0;

            blogPerformance.push({
                title: b.title,
                blog_id: b.blog_id,
                reads: b.activity.total_reads || 0,
                likes: b.activity.total_likes || 0,
                comments: b.activity.total_comments || 0,
                publishedAt: b.publishedAt,
                readTime: b.read_time?.readTimeMinutes || 1
            });
        }
    });

    // Sort by reads descending
    blogPerformance.sort((a, b) => b.reads - a.reads);

    const engagementRate = totalReads > 0 ? (((totalLikes + totalComments) / totalReads) * 100).toFixed(1) : 0;

    return res.status(200).json(new ApiResponse(200, {
        overview: {
            totalReads,
            totalLikes,
            totalComments,
            totalPosts: publishedCount + draftCount,
            publishedCount,
            draftCount,
            engagementRate: `${engagementRate}%`
        },
        topBlogs: blogPerformance.slice(0, 5),
        allBlogs: blogPerformance
    }, 'Analytics retrieved successfully'));
});
