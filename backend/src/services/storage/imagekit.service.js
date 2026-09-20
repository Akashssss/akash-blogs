import ImageKit from 'imagekit';
import { ApiError } from '../../utils/ApiError.js';

/**
 * ImageKit Storage Adapter
 * Uses ImageKit.io for image upload, storage, and CDN delivery.
 * Free tier: 20 GB bandwidth/month, unlimited storage (pay for bandwidth over limit).
 *
 * Required .env variables:
 *   IMAGEKIT_PUBLIC_KEY    - ImageKit public API key
 *   IMAGEKIT_PRIVATE_KEY   - ImageKit private API key
 *   IMAGEKIT_URL_ENDPOINT  - Your ImageKit URL endpoint (e.g., https://ik.imagekit.io/your_id)
 */
export class ImageKitService {
    constructor() {
        this.client = null;
        this.initClient();
    }

    initClient() {
        const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

        if (!publicKey || !privateKey || !urlEndpoint) {
            console.warn('[ImageKit] Credentials not configured. Skipping.');
            return;
        }

        try {
            this.client = new ImageKit({ publicKey, privateKey, urlEndpoint });
            console.log('[ImageKit] Initialized — CDN delivery ready');
        } catch (err) {
            console.error('[ImageKit] Init error:', err.message);
        }
    }

    isAvailable() {
        return this.client !== null;
    }

    /**
     * Uploads a buffer to ImageKit
     * @param {{ buffer, filename, mimeType, folder }} opts
     * @returns {{ provider, url, fileId }}
     */
    async upload({ buffer, filename, mimeType = 'image/webp', folder = 'blog_banners' }) {
        if (!this.isAvailable()) {
            throw new ApiError(500, 'ImageKit is not configured.');
        }

        try {
            const base64 = buffer.toString('base64');
            const dataUri = `data:${mimeType};base64,${base64}`;

            const result = await this.client.upload({
                file: dataUri,
                fileName: filename,
                folder: `/${folder}`,
                useUniqueFileName: false,
                isPrivateFile: false,
                overwriteFile: false,
            });

            return {
                provider: 'imagekit',
                url: result.url,
                fileId: result.fileId,
            };
        } catch (err) {
            throw new ApiError(500, `ImageKit upload failed: ${err.message}`);
        }
    }

    /**
     * Deletes a file from ImageKit by file ID
     * @param {string} fileId
     */
    async delete(fileId) {
        if (!this.isAvailable()) return;
        try {
            await this.client.deleteFile(fileId);
            console.log(`[ImageKit] File deleted: ${fileId}`);
            return { success: true, fileId };
        } catch (err) {
            console.warn('[ImageKit] Delete failed:', err.message);
        }
    }
}

export const imageKitService = new ImageKitService();
export default imageKitService;
