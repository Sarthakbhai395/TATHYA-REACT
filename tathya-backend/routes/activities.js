const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserActivities,
  createActivity,
  deleteActivity
} = require('../controllers/activityController');

// Apply protect middleware to all routes
router.use(protect);

// GET /api/activities - Get user's activities
router.get('/', getUserActivities);

// POST /api/activities - Create new activity
router.post('/', createActivity);

// DELETE /api/activities/:id - Delete activity
router.delete('/:id', deleteActivity);

module.exports = router;
