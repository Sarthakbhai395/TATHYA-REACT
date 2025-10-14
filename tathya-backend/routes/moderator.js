// tathya-backend/routes/moderator.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  approvePost,
  deletePost,
  sendMessageToUser,
  getModeratorMessages
} = require('../controllers/moderatorController');
const { protect } = require('../middleware/authMiddleware');

// All moderator routes require authentication
router.use(protect);

// User management routes
router.get('/users', getAllUsers);

// Post management routes
router.put('/posts/:id/approve', approvePost);
router.delete('/posts/:id', deletePost);

// Messaging routes
router.post('/messages', sendMessageToUser);
router.get('/messages', getModeratorMessages);

module.exports = router;