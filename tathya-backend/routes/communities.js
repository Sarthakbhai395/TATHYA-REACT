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
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Public
router.get('/', getCommunities);


// Protected
router.post('/', protect, createCommunity);
router.route('/').post(protect, createCommunity).get(getCommunities);
router
  .route('/:id')
  .get(optionalProtect, getCommunityById)
  .put(protect, updateCommunity)
  .delete(protect, deleteCommunity);
router.route('/:id/join').post(protect, joinCommunity);
router.route('/:id/leave').post(protect, leaveCommunity);

module.exports = router;
