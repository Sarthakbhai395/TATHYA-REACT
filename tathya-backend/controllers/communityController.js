// tathya-backend/controllers/communityController.js
const Community = require('../models/Community');
const mongoose = require('mongoose');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private/Admin or Verified User
const createCommunity = asyncHandler(async (req, res) => {
  const { name, region, description, tags } = req.body;

  // Basic validation
  if (!name || !region || !description) {
    res.status(400);
    throw new Error('Please provide name, region, and description');
  }

  // Check if community name already exists
  const communityExists = await Community.findOne({ name: name.trim() });
  if (communityExists) {
    res.status(400);
    throw new Error('A community with this name already exists');
  }

  // Create community
  const community = new Community({
    name: name.trim(),
    region: region.trim(),
    description: description.trim(),
    tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [], // Split and clean tags
    members: [req.user._id], // Creator becomes first member
    moderators: [req.user._id], // Creator becomes first moderator
  });

  const createdCommunity = await community.save();

  if (createdCommunity) {
    res.status(201).json({
      _id: createdCommunity._id,
      name: createdCommunity.name,
      region: createdCommunity.region,
      description: createdCommunity.description,
      tags: createdCommunity.tags,
      members: createdCommunity.members.length,
      moderators: createdCommunity.moderators.length,
      createdAt: createdCommunity.createdAt,
      isActive: createdCommunity.isActive,
    });
  } else {
    res.status(400);
    throw new Error('Invalid community data');
  }
});

// @desc    Get all communities (public or filtered)
// @route   GET /api/communities
// @access  Public
const getCommunities = asyncHandler(async (req, res) => {
  const pageSize = 10; // Number of communities per page
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
        ],
      }
    : {};

  const count = await Community.countDocuments({ ...keyword });
  const communities = await Community.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    communities,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get community by ID
// @route   GET /api/communities/:id
// @access  Public
const getCommunityById = asyncHandler(async (req, res) => {
  console.log('Entering getCommunityById for ID:', req.params.id);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.error('Invalid Community ID format:', req.params.id);
    res.status(400);
    throw new Error('Invalid Community ID format');
  }

  try {
    let community = await Community.findById(req.params.id)
      .populate('members', 'fullName email avatar')
      .populate('moderators', 'fullName email avatar');

    if (!community) {
      console.log('Community not found for ID:', req.params.id);
      res.status(404);
      throw new Error('Community not found');
    }

    let isJoined = false;
    if (req.user) {
      isJoined = community.members.some(member => member._id.equals(req.user._id));
      console.log('User', req.user.id, 'isJoined:', isJoined);
    }

    console.log('Community object before response:', community);
    res.json({ ...community.toObject(), isJoined });
  } catch (error) {
    console.error('Error in getCommunityById:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = { getCommunityById };
// @desc    Update community details
// @route   PUT /api/communities/:id
// @access  Private/Moderator
const updateCommunity = asyncHandler(async (req, res) => {
  const { name, region, description, tags, isActive } = req.body;

  const community = await Community.findById(req.params.id);

  if (community) {
    // Check authorization (user is a moderator)
    if (!community.moderators.includes(req.user._id)) {
      res.status(401);
      throw new Error('Not authorized as a moderator of this community');
    }

    community.name = name || community.name;
    community.region = region || community.region;
    community.description = description || community.description;
    community.tags = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : community.tags;
    community.isActive = (isActive !== undefined) ? isActive : community.isActive;

    const updatedCommunity = await community.save();
    res.json(updatedCommunity);
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

// @desc    Delete a community
// @route   DELETE /api/communities/:id
// @access  Private/Admin
const deleteCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (community) {
    // In a real app, check if user is admin
    // if (req.user.role !== 'admin') {
    //   res.status(401);
    //   throw new Error('Not authorized as an admin');
    // }
    await community.remove();
    res.json({ message: 'Community removed' });
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

// @desc    Join a community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (community) {
    // Check if user is already a member
    if (community.members.includes(req.user._id)) {
      res.status(400);
      throw new Error('User is already a member of this community');
    }

    community.members.push(req.user._id);
    const updatedCommunity = await community.save();

    // Add community to user's joined communities list (if you have such a field in User model)
    // const user = await User.findById(req.user._id);
    // if (user && !user.joinedCommunities.includes(community._id)) {
    //   user.joinedCommunities.push(community._id);
    //   await user.save();
    // }

    res.json({
      message: 'Successfully joined the community',
      communityId: updatedCommunity._id,
      members: updatedCommunity.members.length,
    });
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

// @desc    Leave a community
// @route   POST /api/communities/:id/leave
// @access  Private
const leaveCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (community) {
    // Check if user is a member
    if (!community.members.includes(req.user._id)) {
      res.status(400);
      throw new Error('User is not a member of this community');
    }

    // Prevent moderators from leaving unless there's another moderator
    if (community.moderators.includes(req.user._id) && community.moderators.length <= 1) {
      res.status(400);
      throw new Error('Cannot leave community as the only moderator. Please assign another moderator first.');
    }

    community.members = community.members.filter(memberId => !memberId.equals(req.user._id));
    // Also remove from moderators if applicable
    community.moderators = community.moderators.filter(modId => !modId.equals(req.user._id));

    const updatedCommunity = await community.save();

    // Remove community from user's joined communities list (if you have such a field in User model)
    // const user = await User.findById(req.user._id);
    // if (user) {
    //   user.joinedCommunities = user.joinedCommunities.filter(commId => !commId.equals(community._id));
    //   await user.save();
    // }

    res.json({
      message: 'Successfully left the community',
      communityId: updatedCommunity._id,
      members: updatedCommunity.members.length,
    });
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

// @desc    Add a moderator to a community
// @route   POST /api/communities/:id/moderators
// @access  Private/Moderator
const addModerator = asyncHandler(async (req, res) => {
  const { userId } = req.body; // ID of user to be made moderator

  const community = await Community.findById(req.params.id);

  if (community) {
    // Check authorization (user making request is a moderator)
    if (!community.moderators.includes(req.user._id)) {
      res.status(401);
      throw new Error('Not authorized as a moderator of this community');
    }

    // Check if user is already a moderator
    if (community.moderators.includes(userId)) {
      res.status(400);
      throw new Error('User is already a moderator of this community');
    }

    // Check if user is a member (can't make non-member a moderator)
    if (!community.members.includes(userId)) {
      res.status(400);
      throw new Error('User must be a member to become a moderator');
    }

    community.moderators.push(userId);
    const updatedCommunity = await community.save();

    res.json({
      message: 'User added as moderator',
      communityId: updatedCommunity._id,
      moderators: updatedCommunity.moderators.length,
    });
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

// @desc    Remove a moderator from a community
// @route   DELETE /api/communities/:id/moderators/:userId
// @access  Private/Moderator
const removeModerator = asyncHandler(async (req, res) => {
  const { userId } = req.params; // ID of user to be removed as moderator

  const community = await Community.findById(req.params.id);

  if (community) {
    // Check authorization (user making request is a moderator)
    if (!community.moderators.includes(req.user._id)) {
      res.status(401);
      throw new Error('Not authorized as a moderator of this community');
    }

    // Prevent removing the last moderator
    if (community.moderators.length <= 1) {
      res.status(400);
      throw new Error('Cannot remove the last moderator of the community');
    }

    // Check if user is actually a moderator
    if (!community.moderators.includes(userId)) {
      res.status(400);
      throw new Error('User is not a moderator of this community');
    }

    community.moderators = community.moderators.filter(modId => !modId.equals(userId));
    const updatedCommunity = await community.save();

    res.json({
      message: 'User removed as moderator',
      communityId: updatedCommunity._id,
      moderators: updatedCommunity.moderators.length,
    });
  } else {
    res.status(404);
    throw new Error('Community not found');
  }
});

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  addModerator,
  removeModerator,
};