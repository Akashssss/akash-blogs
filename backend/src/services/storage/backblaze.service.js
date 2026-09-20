import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Backblaze B2 Storage Adapter
 * Uses Backblaze B2's S3-compatible API.
 * Free tier: 10 GB storage, 1 GB/day download.
 *
 * Required .env variables:
 *   B2_KEY_ID         - Backblaze Application Key ID
 *   B2_APP_KEY        - Backblaze Application Key
 *   B2_BUCKET_NAME    - Your Backblaze bucket name
 *   B2_ENDPOINT       - Backblaze S3 endpoint (e.g., https://s3.us-west-004.backblazeb2.com)
 *   B2_BUCKET_REGION  - Region (e.g., us-west-004)
 *   B2_CDN_URL        - Optional: Your Cloudflare/custom CDN URL for public files
 */
export class BackblazeService {
    constructor() {
        this.client = null;
        this.bucketName = process.env.B2_BUCKET_NAME || null;
        this.endpoint = process.env.B2_ENDPOINT || null;
        this.cdnUrl = process.env.B2_CDN_URL || null;
        this.initClient();
    }

    initClient() {
        const keyId = process.env.B2_KEY_ID;
        const appKey = process.env.B2_APP_KEY;

        if (!keyId || !appKey || !this.bucketName || !this.endpoint) {
            console.warn('[Backblaze] Credentials not configured. Skipping.');
            return;
        }

        try {
            this.client = new S3Client({
                endpoint: this.endpoint,
                region: process.env.B2_BUCKET_REGION || 'us-west-004',
                credentials: {
                    accessKeyId: keyId,
                    secretAccessKey: appKey,
                },
                forcePathStyle: true,
            });
            console.log('[Backblaze B2] Initialized with S3-compatible API');
        } catch (err) {
            console.error('[Backblaze] Init error:', err.message);
        }
    }

    isAvailable() {
        return this.client !== null && Boolean(this.bucketName);
    }

    /**
     * Uploads a buffer to Backblaze B2
     * @param {{ buffer, filename, mimeType, folder }} opts
     * @returns {{ provider, url, fileId }}
     */
    async upload({ buffer, filename, mimeType = 'image/webp', folder = 'blog_banners' }) {
        if (!this.isAvailable()) {
            throw new ApiError(500, 'Backblaze B2 is not configured.');
        }

        const key = folder ? `${folder}/${filename}` : filename;

        try {
            await this.client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                // Make publicly readable
                ACL: 'public-read',
                CacheControl: 'public, max-age=31536000, immutable',
            }));

            // Build public URL: CDN or direct B2 URL
            const url = this.cdnUrl
                ? `${this.cdnUrl.replace(/\/$/, '')}/${key}`
                : `${this.endpoint}/${this.bucketName}/${key}`;

            return {
                provider: 'backblaze_b2',
                url,
                fileId: key,
            };
        } catch (err) {
            throw new ApiError(500, `Backblaze upload failed: ${err.message}`);
        }
    }

    /**
     * Deletes a file from Backblaze B2
     * @param {string} fileId - The object key (folder/filename)
     */
    async delete(fileId) {
        if (!this.isAvailable()) return;
        try {
            await this.client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileId,
            }));
            console.log(`[Backblaze B2] File deleted: ${fileId}`);
            return { success: true, fileId };
        } catch (err) {
            console.warn('[Backblaze B2] Delete failed:', err.message);
        }
    }
}

export const backblazeService = new BackblazeService();
export default backblazeService;
