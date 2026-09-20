import { Router } from 'express';
import {
    addComment,
    getBlogComments,
    getReplies,
    deleteComment
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/add-comment', verifyJWT, addComment);
router.route('/get-blog-comments').get(getBlogComments).post(getBlogComments);
router.route('/get-replies').get(getReplies).post(getReplies);
router.route('/delete-comment').post(verifyJWT, deleteComment).delete(verifyJWT, deleteComment);

export default router;
