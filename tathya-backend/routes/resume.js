const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserResume,
  saveUserResume,
  updateUserResume,
  deleteUserResume
} = require('../controllers/resumeController');

// Apply protect middleware to all routes
router.use(protect);

// GET /api/resume - Get user's resume data
router.get('/', getUserResume);

// POST /api/resume - Save user's resume data
router.post('/', saveUserResume);

// PUT /api/resume - Update user's resume data
router.put('/', updateUserResume);

// DELETE /api/resume - Delete user's resume data
router.delete('/', deleteUserResume);

module.exports = router;
