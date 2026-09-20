import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ImageProcessorService from '../services/imageProcessor.service.js';
import StorageService from '../services/storage/storage.service.js';
import googleDriveService from '../services/storage/googleDrive.service.js';
import { nanoid } from 'nanoid';

export const uploadBanner = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No image file provided.');
    }

    // 1. Process and optimize image with Sharp (resize to max 1400px, convert to WebP, strip EXIF)
    const optimized = await ImageProcessorService.optimizeBanner(req.file.buffer, {
        maxWidth: 1400,
        quality: 82
    });

    const uniqueFilename = `banner-${Date.now()}-${nanoid(6)}.${optimized.extension}`;

    // 2. Clean up previous image if oldPublicId is provided to prevent orphaned files
    if (req.body.oldPublicId) {
        await StorageService.delete(req.body.oldPublicId);
    }

    // 3. Upload to Google Drive / configured storage engine
    const uploadResult = await StorageService.upload({
        buffer: optimized.buffer,
        filename: uniqueFilename,
        mimeType: optimized.mimeType,
        folder: 'blog_banners'
    });

    return res.status(200).json(new ApiResponse(200, {
        imageUrl: uploadResult.url,
        publicId: uploadResult.fileId,
        provider: uploadResult.provider,
        stats: {
            originalSize: `${(optimized.originalSize / 1024).toFixed(1)} KB`,
            optimizedSize: `${(optimized.optimizedSize / 1024).toFixed(1)} KB`,
            percentageSaved: optimized.percentageSaved
        }
    }, 'Banner image optimized and uploaded successfully'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No avatar image provided.');
    }

    // Process with Sharp (crop to 300x300 square, convert to WebP)
    const optimized = await ImageProcessorService.optimizeAvatar(req.file.buffer);
    const uniqueFilename = `avatar-${Date.now()}-${nanoid(6)}.${optimized.extension}`;

    if (req.body.oldPublicId) {
        await StorageService.delete(req.body.oldPublicId);
    }

    const uploadResult = await StorageService.upload({
        buffer: optimized.buffer,
        filename: uniqueFilename,
        mimeType: optimized.mimeType,
        folder: 'user_avatars'
    });

    return res.status(200).json(new ApiResponse(200, {
        imageUrl: uploadResult.url,
        publicId: uploadResult.fileId,
        provider: uploadResult.provider,
        stats: {
            originalSize: `${(optimized.originalSize / 1024).toFixed(1)} KB`,
            optimizedSize: `${(optimized.optimizedSize / 1024).toFixed(1)} KB`,
            percentageSaved: optimized.percentageSaved
        }
    }, 'Avatar optimized and uploaded successfully'));
});

export const deleteImage = asyncHandler(async (req, res) => {
    const { publicId, provider } = req.body;
    if (!publicId) {
        throw new ApiError(400, 'Public ID / File ID is required for deletion.');
    }

    await StorageService.delete(publicId, provider);
    return res.status(200).json(new ApiResponse(200, null, 'Image deleted successfully.'));
});

export const streamGoogleDriveMedia = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    if (!fileId) throw new ApiError(400, 'File ID required');

    try {
        const fileStream = await googleDriveService.getFileStream(fileId);
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        fileStream.pipe(res);
    } catch (error) {
        throw new ApiError(404, 'File not found on storage');
    }
});

export const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No video file provided.');
    }

    const mimeType = req.file.mimetype || 'video/mp4';
    const ext = req.file.originalname?.split('.').pop() || 'mp4';
    const uniqueFilename = `video-${Date.now()}-${nanoid(6)}.${ext}`;

    if (req.body.oldPublicId) {
        await StorageService.delete(req.body.oldPublicId);
    }

    const uploadResult = await StorageService.upload({
        buffer: req.file.buffer,
        filename: uniqueFilename,
        mimeType,
        folder: 'blog_videos'
    });

    return res.status(200).json(new ApiResponse(200, {
        videoUrl: uploadResult.url,
        imageUrl: uploadResult.url,
        publicId: uploadResult.fileId,
        provider: uploadResult.provider,
        size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
    }, 'Video uploaded successfully'));
});

