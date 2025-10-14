// tathya-backend/routes/messages.js
const express = require('express');
const router = express.Router();
const {
  getUserMessages,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes require authentication
router.use(protect);

// Get messages for current user
router.get('/', getUserMessages);

// Send a message
router.post('/', sendMessage);

module.exports = router;