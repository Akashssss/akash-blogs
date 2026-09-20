import axios from 'axios';

/**
 * Uploads a blog banner or editor image to the backend:
 * - Optimized in-memory via Sharp (WebP conversion, auto-resize)
 * - Saved to Google Drive or fallback storage
 * - Returns direct CDN URL, file ID, and compression statistics
 */
export async function uploadImage(file, oldPublicId = null) {
    const formData = new FormData();
    formData.append('banner', file);
    if (oldPublicId) {
        formData.append('oldPublicId', oldPublicId);
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const payload = response.data?.data || response.data;

        return {
            success: 1,
            file: {
                url: payload.imageUrl,
                publicId: payload.publicId,
                provider: payload.provider,
                stats: payload.stats
            }
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            success: 0,
            error: error.response?.data?.message || 'Error uploading image'
        };
    }
}

/**
 * Uploads a user profile avatar:
 * - Center-cropped to square and converted to WebP via Sharp
 */
export async function uploadAvatarImage(file, oldPublicId = null) {
    const formData = new FormData();
    formData.append('profile', file);
    if (oldPublicId) {
        formData.append('oldPublicId', oldPublicId);
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/uploadProfileImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const payload = response.data?.data || response.data;

        return {
            success: 1,
            file: {
                url: payload.imageUrl,
                publicId: payload.publicId,
                stats: payload.stats
            }
        };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return {
            success: 0,
            error: error.response?.data?.message || 'Error uploading avatar'
        };
    }
}

/**
 * Uploads a video file to the backend:
 * - Directly buffered and streamed to Google Drive or fallback storage
 */
export async function uploadVideo(file, oldPublicId = null) {
    const formData = new FormData();
    formData.append('video', file);
    if (oldPublicId) {
        formData.append('oldPublicId', oldPublicId);
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/uploadVideo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const payload = response.data?.data || response.data;

        return {
            success: 1,
            file: {
                url: payload.videoUrl || payload.imageUrl,
                publicId: payload.publicId,
                provider: payload.provider,
                size: payload.size
            }
        };
    } catch (error) {
        console.error('Error uploading video:', error);
        return {
            success: 0,
            error: error.response?.data?.message || 'Error uploading video'
        };
    }
}

/**
 * Deletes an image from storage (Google Drive / Cloudinary / local)
 */
export async function deleteImage(publicId, provider = null) {
    try {
        await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/delete`, {
            data: { publicId, provider }
        });
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

