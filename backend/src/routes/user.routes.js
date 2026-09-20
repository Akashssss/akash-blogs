import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    updateProfileImage,
    searchUsers,
    toggleBookmark
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/get-profile').get(getProfile).post(getProfile);
router.post('/update-profile', verifyJWT, updateProfile);
router.post('/update-profile-image', verifyJWT, updateProfileImage);
router.route('/search-users').get(searchUsers).post(searchUsers);
router.post('/toggle-bookmark', verifyJWT, toggleBookmark);

export default router;
