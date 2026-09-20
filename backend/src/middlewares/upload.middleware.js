import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Use memory storage so Sharp / processors can work in memory
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, WEBP, SVG, and GIF images are allowed.'), false);
    }
};

const mediaFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid media file type. Only images and standard videos (MP4, WEBM, MOV) are allowed.'), false);
    }
};

export const uploadMemory = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB max image size
    }
});

export const uploadMediaMemory = multer({
    storage,
    fileFilter: mediaFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max video/media size
    }
});

export default uploadMemory;
