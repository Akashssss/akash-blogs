import { nanoid } from 'nanoid';
import Blog from '../models/Blog.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import Comment from '../models/Comment.model.js';
import StorageService from '../services/storage/storage.service.js';
import { calculateReadTime } from '../utils/readTime.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrUpdateBlog = asyncHandler(async (req, res) => {
    const authorId = req.user;
    let { title, des, banner, banner_public_id, tags = [], content, draft = false, id } = req.body;

    if (!title || !title.trim().length) {
        throw new ApiError(400, 'Blog title is required.');
    }

    if (!draft) {
        if (!des || !des.trim().length || des.trim().length > 250) {
            throw new ApiError(400, 'Description is required and must be under 250 characters.');
        }
        if (!banner || !banner.trim().length) {
            throw new ApiError(400, 'A blog cover banner is required to publish.');
        }
        if (!content || !content.blocks || !content.blocks.length) {
            throw new ApiError(400, 'Blog content cannot be empty.');
        }
        if (!tags.length || tags.length > 10) {
            throw new ApiError(400, 'Please provide between 1 and 10 tags.');
        }
    }

    const formattedTags = tags.map((t) => t.toLowerCase().trim());
    const readTime = calculateReadTime(content);

    // Update existing blog
    if (id) {
        const existingBlog = await Blog.findOne({ blog_id: id });
        if (!existingBlog) {
            throw new ApiError(404, 'Blog not found to update.');
        }
        if (existingBlog.author.toString() !== authorId) {
            throw new ApiError(403, 'Unauthorized to edit this blog.');
        }

        // Clean up previous banner if banner changed
        if (banner_public_id && existingBlog.banner_public_id && existingBlog.banner_public_id !== banner_public_id) {
            await StorageService.delete(existingBlog.banner_public_id);
        }

        existingBlog.title = title;
        existingBlog.des = des;
        existingBlog.banner = banner;
        if (banner_public_id) existingBlog.banner_public_id = banner_public_id;
        existingBlog.tags = formattedTags;
        existingBlog.content = content;
        existingBlog.draft = Boolean(draft);
        existingBlog.read_time = readTime;

        await existingBlog.save();
        return res.status(200).json({ id: existingBlog.blog_id });
    }

    // Create new blog
    const slug = title
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .trim()
        .slice(0, 50);

    const blog_id = `${slug}-${nanoid(6)}`;

    const newBlog = new Blog({
        title,
        des,
        banner,
        banner_public_id: banner_public_id || '',
        tags: formattedTags,
        content,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
        read_time: readTime
    });

    const savedBlog = await newBlog.save();

    // Increment user post counter and append blog reference
    const postIncrement = draft ? 0 : 1;
    await User.findByIdAndUpdate(authorId, {
        $inc: { 'account_info.total_posts': postIncrement },
        $push: { blogs: savedBlog._id }
    });

    return res.status(201).json({ id: savedBlog.blog_id });
});

export const getLatestBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.body?.page || req.query?.page || 1, 10);
    const limit = parseInt(req.body?.limit || req.query?.limit || 5, 10);

    const blogs = await Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt read_time -_id")
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json({ blogs });
});

export const getTrendingBlogs = asyncHandler(async (req, res) => {
    const trendingBlogs = await Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, publishedAt: -1 })
        .select("blog_id title publishedAt read_time -_id")
        .limit(5);

    return res.status(200).json({ blogs: trendingBlogs });
});

export const searchBlogs = asyncHandler(async (req, res) => {
    const { tag, query, page = 1, author, limit = 5, eliminateBlog } = { ...req.query, ...req.body };
    const maxLimit = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);

    let findQuery = { draft: false };

    if (tag) {
        findQuery.tags = tag.toLowerCase();
        if (eliminateBlog) {
            findQuery.blog_id = { $ne: eliminateBlog };
        }
    } else if (query) {
        // Safe regex escaping to prevent ReDoS attacks
        const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        findQuery.title = new RegExp(sanitizedQuery, 'i');
    } else if (author) {
        findQuery.author = author;
    }

    const blogs = await Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt read_time -_id")
        .skip((pageNum - 1) * maxLimit)
        .limit(maxLimit);

    return res.status(200).json({ blogs });
});

export const getAllLatestBlogsCount = asyncHandler(async (req, res) => {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
});

export const getSearchBlogsCount = asyncHandler(async (req, res) => {
    const { tag, query, author } = { ...req.query, ...req.body };
    let findQuery = { draft: false };

    if (tag) {
        findQuery.tags = tag.toLowerCase();
    } else if (query) {
        const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        findQuery.title = new RegExp(sanitizedQuery, 'i');
    } else if (author) {
        findQuery.author = author;
    }

    const count = await Blog.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: count });
});

export const getBlog = asyncHandler(async (req, res) => {
    const { blog_id, draft, mode } = { ...req.query, ...req.body };
    const increment = mode !== 'edit' ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
        { blog_id },
        { $inc: { "activity.total_reads": increment } },
        { new: true }
    ).populate("author", "personal_info.fullname personal_info.username personal_info.profile_img social_links personal_info.bio");

    if (!blog) {
        throw new ApiError(404, 'Blog not found.');
    }

    if (blog.draft && !draft) {
        throw new ApiError(403, 'Draft blogs can only be accessed by author.');
    }

    if (increment > 0 && blog.author) {
        await User.findByIdAndUpdate(blog.author._id, {
            $inc: { "account_info.total_reads": increment }
        });
    }

    return res.status(200).json({ blog });
});

export const likeBlog = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { _id, isLikedByUser } = req.body;
    const incrementVal = !isLikedByUser ? 1 : -1;

    const blog = await Blog.findByIdAndUpdate(
        _id,
        { $inc: { "activity.total_likes": incrementVal } },
        { new: true }
    );

    if (!blog) throw new ApiError(404, 'Blog not found.');

    if (!isLikedByUser) {
        const notification = new Notification({
            type: "like",
            blog: _id,
            notification_for: blog.author,
            user: userId
        });
        await notification.save();
        return res.status(200).json({ liked_by_user: true });
    } else {
        await Notification.findOneAndDelete({ user: userId, blog: _id, type: "like" });
        return res.status(200).json({ liked_by_user: false });
    }
});

export const isLikedByUser = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { _id } = { ...req.query, ...req.body };

    const result = await Notification.exists({
        user: userId,
        type: "like",
        blog: _id
    });

    return res.status(200).json({ result: Boolean(result) });
});

export const getUserWrittenBlogs = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { page = 1, draft, query, deletedDocCount = 0 } = { ...req.query, ...req.body };
    const maxLimit = 5;
    let skipDocs = (parseInt(page, 10) - 1) * maxLimit;

    if (deletedDocCount) {
        skipDocs = Math.max(0, skipDocs - parseInt(deletedDocCount, 10));
    }

    const filter = { author: userId, draft: Boolean(draft) };
    if (query) {
        const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.title = new RegExp(sanitized, 'i');
    }

    const blogs = await Blog.find(filter)
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select("title banner publishedAt blog_id activity des draft read_time -_id");

    return res.status(200).json({ blogs });
});

export const getUserWrittenBlogsCount = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { draft, query } = { ...req.query, ...req.body };

    const filter = { author: userId, draft: Boolean(draft) };
    if (query) {
        const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.title = new RegExp(sanitized, 'i');
    }

    const count = await Blog.countDocuments(filter);
    return res.status(200).json({ totalDocs: count });
});

export const deleteBlog = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { blog_id } = req.body;

    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new ApiError(404, 'Blog not found.');

    if (blog.author.toString() !== userId && req.userRole !== 'admin') {
        throw new ApiError(403, 'You are not authorized to delete this blog.');
    }

    // Cascade delete notifications and comments
    await Promise.all([
        Notification.deleteMany({ blog: blog._id }),
        Comment.deleteMany({ blog_id: blog._id }),
        // Fix bug: clean up blogs array in User model (was 'blog' before)
        User.findByIdAndUpdate(userId, {
            $pull: { blogs: blog._id },
            $inc: { "account_info.total_posts": blog.draft ? 0 : -1 }
        })
    ]);

    // Delete stored banner if exists
    if (blog.banner_public_id) {
        await StorageService.delete(blog.banner_public_id);
    }

    await Blog.findByIdAndDelete(blog._id);
    return res.status(200).json(new ApiResponse(200, null, 'Blog deleted successfully.'));
});
