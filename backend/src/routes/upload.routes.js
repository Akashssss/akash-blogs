import { Router } from 'express';
import {
    uploadBanner,
    uploadAvatar,
    uploadVideo,
    deleteImage,
    streamGoogleDriveMedia
} from '../controllers/upload.controller.js';
import { uploadMemory, uploadMediaMemory } from '../middlewares/upload.middleware.js';

const router = Router();

// Banner and image upload with Sharp optimization & Google Drive / fallback storage
router.post('/upload', uploadMediaMemory.single('banner'), uploadBanner);

// Video upload with Google Drive / multi-adapter storage (supports up to 100MB)
router.post('/uploadVideo', uploadMediaMemory.single('video'), uploadVideo);

// Avatar upload with Sharp center-crop & Google Drive / fallback storage
router.post('/uploadProfileImage', uploadMemory.single('profile'), uploadAvatar);

// Delete file from storage
router.route('/delete').delete(deleteImage).post(deleteImage);

// Google Drive media streaming proxy endpoint
router.get('/api/v2/media/:fileId', streamGoogleDriveMedia);

export default router;
