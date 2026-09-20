import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.model.js';

export const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, 'Unauthorized request. No token provided.');
        }

        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
        req.user = decoded.id;

        // Optionally fetch user role if needed for RBAC
        if (decoded.role) {
            req.userRole = decoded.role;
        }

        next();
    } catch (error) {
        if (error instanceof ApiError) return next(error);
        return next(new ApiError(401, 'Invalid or expired access token.'));
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user).select('role');
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Forbidden: Admin access required.');
        }
        next();
    } catch (error) {
        next(error);
    }
};
