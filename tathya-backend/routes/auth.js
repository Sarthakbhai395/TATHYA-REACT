const express = require('express');
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	getUserProfile,
	updateUserProfile,
	resetPasswordViaSms,
	verifySmsCode,
	sendVerificationSms,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

router.post('/reset-password-via-sms', resetPasswordViaSms);
router.post('/verify-sms-code', verifySmsCode);
router.post('/send-verification-sms', sendVerificationSms);

module.exports = router;
