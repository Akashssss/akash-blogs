import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import googleDriveService from './googleDrive.service.js';
import backblazeService from './backblaze.service.js';
import imageKitService from './imagekit.service.js';
import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../../uploads');

// Ensure local uploads directory exists for fallback
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary if credentials exist (ready for future or on-demand switch)
const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export class StorageService {
    /**
     * Uploads an optimized buffer using the preferred storage provider:
     * 1. Google Drive (Primary default free storage engine)
     * 2. Backblaze B2 (High-capacity S3-compatible cloud storage)
     * 3. ImageKit (CDN delivery and image processing)
     * 4. Cloudinary (Kept configured, activated only if USE_CLOUDINARY=true or STORAGE_DRIVER=cloudinary)
     * 5. Local Disk (Instant zero-config development and offline fallback)
     */
    static async upload({ buffer, filename, mimeType = 'image/webp', folder = 'blog_banners' }) {
        const preferredDriver = (process.env.STORAGE_DRIVER || 'google_drive').toLowerCase();

        // 1. Google Drive (Primary choice)
        if (preferredDriver === 'google_drive' || preferredDriver === 'auto') {
            if (googleDriveService.isAvailable()) {
                try {
                    const result = await googleDriveService.uploadFile({ buffer, filename, mimeType });
                    return {
                        provider: 'google_drive',
                        url: result.directUrl,
                        fileId: result.fileId,
                        webViewLink: result.webViewLink
                    };
                } catch (err) {
                    console.error('[Storage] Google Drive upload failed, trying fallback adapters:', err.message);
                }
            } else {
                console.warn('[Storage] Google Drive is primary but not configured or credentials missing. Attempting other adapters...');
            }
        }

        // 2. Backblaze B2 (S3-compatible adapter)
        if (preferredDriver === 'backblaze' || backblazeService.isAvailable()) {
            if (backblazeService.isAvailable()) {
                try {
                    const result = await backblazeService.upload({ buffer, filename, mimeType, folder });
                    return result;
                } catch (err) {
                    console.error('[Storage] Backblaze B2 upload failed:', err.message);
                }
            }
        }

        // 3. ImageKit adapter
        if (preferredDriver === 'imagekit' || imageKitService.isAvailable()) {
            if (imageKitService.isAvailable()) {
                try {
                    const result = await imageKitService.upload({ buffer, filename, mimeType, folder });
                    return result;
                } catch (err) {
                    console.error('[Storage] ImageKit upload failed:', err.message);
                }
            }
        }

        // 4. Cloudinary (remains setup, but dormant unless explicitly enabled)
        const useCloudinary = process.env.USE_CLOUDINARY === 'true' || preferredDriver === 'cloudinary';
        if (useCloudinary && isCloudinaryConfigured) {
            try {
                const uploadPromise = new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder, resource_type: 'auto', format: 'webp' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });

                const result = await uploadPromise;
                return {
                    provider: 'cloudinary',
                    url: result.secure_url,
                    fileId: result.public_id
                };
            } catch (err) {
                console.error('[Storage] Cloudinary upload failed, falling back to local disk:', err.message);
            }
        }

        // 5. Local Disk Fallback (Zero config, completely reliable)
        try {
            const filePath = path.join(uploadsDir, filename);
            await fs.promises.writeFile(filePath, buffer);
            const domain = process.env.SERVER_DOMAIN || `http://localhost:${process.env.PORT || 3000}`;
            return {
                provider: 'local',
                url: `${domain}/uploads/${filename}`,
                fileId: filename
            };
        } catch (error) {
            throw new ApiError(500, `All storage options failed including local disk: ${error.message}`);
        }
    }

    /**
     * Deletes a file by identifier across storage providers
     */
    static async delete(fileId, provider = null) {
        if (!fileId) return;

        // Try Google Drive
        if (provider === 'google_drive' || (googleDriveService.isAvailable() && !provider)) {
            try {
                return await googleDriveService.deleteFile(fileId);
            } catch (err) {
                console.warn('[Storage] Google Drive delete failed:', err.message);
            }
        }

        // Try Backblaze B2
        if (provider === 'backblaze_b2' || (backblazeService.isAvailable() && !provider)) {
            try {
                return await backblazeService.delete(fileId);
            } catch (err) {
                console.warn('[Storage] Backblaze delete failed:', err.message);
            }
        }

        // Try ImageKit
        if (provider === 'imagekit' || (imageKitService.isAvailable() && !provider)) {
            try {
                return await imageKitService.delete(fileId);
            } catch (err) {
                console.warn('[Storage] ImageKit delete failed:', err.message);
            }
        }

        // Try Cloudinary
        if (provider === 'cloudinary' || (isCloudinaryConfigured && !provider)) {
            try {
                await cloudinary.uploader.destroy(fileId);
                return { success: true, fileId };
            } catch (err) {
                console.warn('[Storage] Cloudinary delete failed:', err.message);
            }
        }

        // Try Local Disk
        try {
            const filePath = path.join(uploadsDir, fileId);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
            return { success: true, fileId };
        } catch (err) {
            console.warn('[Storage] Local file delete failed:', err.message);
        }
    }
}

export default StorageService;
