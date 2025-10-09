const express = require('express');
const router = express.Router();
const {
	createCommunity,
	getCommunities,
	getCommunityById,
	updateCommunity,
	deleteCommunity,
	joinCommunity,
	leaveCommunity,
	addModerator,
	removeModerator,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getCommunities);
router.get('/:id', getCommunityById);

// Protected
router.post('/', protect, createCommunity);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.post('/:id/moderators', protect, addModerator);
router.delete('/:id/moderators/:userId', protect, removeModerator);

module.exports = router;
