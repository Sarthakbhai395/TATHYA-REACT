const express = require('express');
const router = express.Router();
const {
	createPost,
	getPostsByCommunity,
	getPostById,
	updatePost,
	deletePost,
	likePost,
	addComment,
	likeComment,
	getPostsForModeration,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Public routes
router.get('/community/:communityId', getPostsByCommunity);
// Global recent posts
// Global recent posts
const { getRecentPosts } = require('../controllers/postController');
router.get('/', getRecentPosts);
router.get('/moderation', protect, getPostsForModeration);
router.get('/:id', getPostById);

// Protected routes
// Allow multipart/form-data uploads under field name 'attachments' (multiple files)
router.post('/', protect, upload.array('attachments', 8), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.post('/:postId/comments/:commentId/like', protect, likeComment);
router.post('/:postId/comments/:commentId/replies/:replyId/like', protect, likeComment);

module.exports = router;