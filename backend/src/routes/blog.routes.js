import { Router } from 'express';
import {
    createOrUpdateBlog,
    getLatestBlogs,
    getTrendingBlogs,
    searchBlogs,
    getAllLatestBlogsCount,
    getSearchBlogsCount,
    getBlog,
    likeBlog,
    isLikedByUser,
    getUserWrittenBlogs,
    getUserWrittenBlogsCount,
    deleteBlog
} from '../controllers/blog.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create-blog', verifyJWT, createOrUpdateBlog);

// Feed & Trending - supporting both GET and legacy POST
router.route('/latest-blogs').get(getLatestBlogs).post(getLatestBlogs);
router.get('/trending-blogs', getTrendingBlogs);
router.route('/search-blogs').get(searchBlogs).post(searchBlogs);
router.route('/all-latest-blogs-count').get(getAllLatestBlogsCount).post(getAllLatestBlogsCount);
router.route('/search-blogs-count').get(getSearchBlogsCount).post(getSearchBlogsCount);

// Single Blog
router.route('/get-blog').get(getBlog).post(getBlog);
router.post('/like_blog', verifyJWT, likeBlog);
router.route('/isLiked-by-user').get(verifyJWT, isLikedByUser).post(verifyJWT, isLikedByUser);

// User Blogs Management
router.route('/user-written-blogs').get(verifyJWT, getUserWrittenBlogs).post(verifyJWT, getUserWrittenBlogs);
router.route('/user-written-blogs-count').get(verifyJWT, getUserWrittenBlogsCount).post(verifyJWT, getUserWrittenBlogsCount);
router.route('/delete-blog').post(verifyJWT, deleteBlog).delete(verifyJWT, deleteBlog);

export default router;
