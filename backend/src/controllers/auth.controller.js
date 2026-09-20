import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import admin from 'firebase-admin';
import User from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateUsername = async (email) => {
    let username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, '');
    let isUsernameUnique = await User.exists({ "personal_info.username": username });
    return isUsernameUnique ? `${username}_${nanoid(4)}` : username;
};

const formatUserData = (user) => {
    const access_token = jwt.sign(
        { id: user._id, role: user.role || 'author' },
        process.env.SECRET_ACCESS_KEY,
        { expiresIn: '30d' }
    );

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        role: user.role || 'author'
    };
};

export const signup = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || fullname.trim().length < 3) {
        throw new ApiError(400, 'Fullname must be at least 3 letters long.');
    }
    if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        throw new ApiError(400, 'Please enter a valid email address.');
    }
    if (!password || !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password)) {
        throw new ApiError(400, 'Password must be 6-20 characters long with 1 numeric, 1 lowercase, and 1 uppercase character.');
    }

    const existingUser = await User.findOne({ "personal_info.email": email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
        personal_info: {
            fullname,
            email: email.toLowerCase(),
            password: hashedPassword,
            username
        }
    });

    const savedUser = await user.save();
    return res.status(201).json(formatUserData(savedUser));
});

export const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required.');
    }

    const user = await User.findOne({ "personal_info.email": email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, 'No account found with this email.');
    }

    if (user.google_auth) {
        throw new ApiError(403, 'This account was registered using Google. Please continue with Google Sign-In.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
    if (!isPasswordValid) {
        throw new ApiError(403, 'Invalid email or password.');
    }

    return res.status(200).json(formatUserData(user));
});

export const googleAuth = asyncHandler(async (req, res) => {
    const { access_token } = req.body;
    if (!access_token) {
        throw new ApiError(400, 'Google access token is required.');
    }

    const decodedUser = await admin.auth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    let user = await User.findOne({ "personal_info.email": email }).select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth role"
    );

    if (user) {
        if (!user.google_auth) {
            throw new ApiError(403, 'This email was signed up with password. Please sign in using password.');
        }
    } else {
        const username = await generateUsername(email);
        user = new User({
            personal_info: {
                fullname: name,
                email,
                profile_img: picture,
                username,
            },
            google_auth: true
        });
        await user.save();
    }

    return res.status(200).json(formatUserData(user));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(newPassword)) {
        throw new ApiError(400, 'Password must be 6-20 characters long with 1 numeric, 1 lowercase, and 1 uppercase character.');
    }

    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, 'User not found.');

    if (user.google_auth) {
        throw new ApiError(403, 'Cannot change password on accounts created via Google login.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.personal_info.password);
    if (!isMatch) {
        throw new ApiError(403, 'Incorrect current password.');
    }

    user.personal_info.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password updated successfully.'));
});
