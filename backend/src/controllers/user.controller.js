import User from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
    const { username } = { ...req.query, ...req.body };
    if (!username) throw new ApiError(400, 'Username is required');

    const user = await User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs");

    if (!user) {
        throw new ApiError(404, 'User profile not found.');
    }

    return res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { username, bio, social_links = {} } = req.body;

    if (!username || username.trim().length < 3) {
        throw new ApiError(400, 'Username must be at least 3 letters long.');
    }
    if (bio && bio.length > 200) {
        throw new ApiError(400, 'Bio must not exceed 200 characters.');
    }

    // Validate social links format
    for (const key of Object.keys(social_links)) {
        const link = social_links[key];
        if (link && link.trim().length) {
            try {
                const parsed = new URL(link);
                if (key !== 'website' && !parsed.hostname.includes(key)) {
                    throw new ApiError(400, `Invalid ${key} link URL.`);
                }
            } catch (err) {
                if (err instanceof ApiError) throw err;
                throw new ApiError(400, `Please provide valid full URLs (with https://) for social links.`);
            }
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            "personal_info.username": username.trim(),
            "personal_info.bio": bio || '',
            social_links
        },
        { new: true, runValidators: true }
    );

    return res.status(200).json({ username: updatedUser.personal_info.username });
});

export const updateProfileImage = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { url } = req.body;

    if (!url) throw new ApiError(400, 'Image URL is required.');

    await User.findByIdAndUpdate(userId, {
        "personal_info.profile_img": url
    });

    return res.status(200).json({ profile_img: url });
});

export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = { ...req.query, ...req.body };
    if (!query) return res.status(200).json({ users: [] });

    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({ "personal_info.username": new RegExp(sanitized, 'i') })
        .limit(50)
        .select('personal_info.fullname personal_info.username personal_info.profile_img -_id');

    return res.status(200).json({ users });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
    const userId = req.user;
    const { blog_id } = req.body;

    if (!blog_id) throw new ApiError(400, 'Blog ID required.');

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarks.includes(blog_id);

    if (isBookmarked) {
        await User.findByIdAndUpdate(userId, { $pull: { bookmarks: blog_id } });
        return res.status(200).json(new ApiResponse(200, { bookmarked: false }, 'Removed from bookmarks'));
    } else {
        await User.findByIdAndUpdate(userId, { $push: { bookmarks: blog_id } });
        return res.status(200).json(new ApiResponse(200, { bookmarked: true }, 'Saved to bookmarks'));
    }
});
