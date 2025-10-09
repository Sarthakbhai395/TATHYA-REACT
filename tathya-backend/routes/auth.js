const express = require('express');
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	getUserProfile,
	updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
