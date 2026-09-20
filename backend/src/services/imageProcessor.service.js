import sharp from 'sharp';
import { ApiError } from '../utils/ApiError.js';

export class ImageProcessorService {
    /**
     * Optimizes a blog banner image:
     * - Resizes to max width (1400px), maintaining aspect ratio
     * - Converts to WebP format with quality 80
     * - Strips unsafe EXIF metadata while preserving orientation
     * - Returns optimized buffer and compression analytics
     */
    static async optimizeBanner(fileBuffer, options = {}) {
        try {
            const originalSize = fileBuffer.length;
            const metadata = await sharp(fileBuffer).metadata();

            const maxWidth = options.maxWidth || 1400;
            const quality = options.quality || 82;

            let pipeline = sharp(fileBuffer).rotate(); // auto-orient based on EXIF before stripping

            if (metadata.width && metadata.width > maxWidth) {
                pipeline = pipeline.resize({
                    width: maxWidth,
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }

            const optimizedBuffer = await pipeline
                .webp({ quality, effort: 4 })
                .toBuffer();

            const optimizedSize = optimizedBuffer.length;
            const percentageSaved = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);

            return {
                buffer: optimizedBuffer,
                mimeType: 'image/webp',
                extension: 'webp',
                originalSize,
                optimizedSize,
                savedBytes: originalSize - optimizedSize,
                percentageSaved: `${percentageSaved}%`,
                width: metadata.width > maxWidth ? maxWidth : metadata.width,
                height: metadata.height
            };
        } catch (error) {
            console.error('[Sharp] Optimization failed:', error);
            throw new ApiError(500, `Image optimization failed: ${error.message}`);
        }
    }

    /**
     * Optimizes a user avatar image:
     * - Center-crops to exact 300x300 square
     * - Converts to WebP with quality 80
     * - Strips EXIF metadata
     */
    static async optimizeAvatar(fileBuffer) {
        try {
            const originalSize = fileBuffer.length;

            const optimizedBuffer = await sharp(fileBuffer)
                .rotate()
                .resize({
                    width: 300,
                    height: 300,
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 80, effort: 4 })
                .toBuffer();

            const optimizedSize = optimizedBuffer.length;
            const percentageSaved = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);

            return {
                buffer: optimizedBuffer,
                mimeType: 'image/webp',
                extension: 'webp',
                originalSize,
                optimizedSize,
                percentageSaved: `${percentageSaved}%`
            };
        } catch (error) {
            console.error('[Sharp] Avatar optimization failed:', error);
            throw new ApiError(500, `Avatar optimization failed: ${error.message}`);
        }
    }

    /**
     * Generates both standard banner and lightweight thumbnail
     */
    static async generateVariants(fileBuffer) {
        const [banner, thumbnail] = await Promise.all([
            this.optimizeBanner(fileBuffer, { maxWidth: 1400 }),
            sharp(fileBuffer)
                .rotate()
                .resize({ width: 450, height: 280, fit: 'cover' })
                .webp({ quality: 75 })
                .toBuffer()
        ]);

        return {
            banner,
            thumbnail: {
                buffer: thumbnail,
                mimeType: 'image/webp',
                extension: 'webp',
                size: thumbnail.length
            }
        };
    }
}

export default ImageProcessorService;
