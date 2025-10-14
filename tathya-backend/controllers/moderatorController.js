// tathya-backend/controllers/moderatorController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');

// @desc    Get all users (for moderator dashboard)
// @route   GET /api/moderator/users
// @access  Private/Moderator
const getAllUsers = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }

  try {
    // Get all users except the current moderator
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500);
    throw new Error('Server error while fetching users');
  }
});

// @desc    Approve a post
// @route   PUT /api/moderator/posts/:id/approve
// @access  Private/Moderator
const approvePost = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }

  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    
    // Update the post's approved status
    post.approved = true;
    const updatedPost = await post.save();
    
    res.json({ 
      message: 'Post approved successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while approving post');
  }
});

// @desc    Delete a post
// @route   DELETE /api/moderator/posts/:id
// @access  Private/Moderator
const deletePost = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }

  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    
    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while deleting post');
  }
});

// @desc    Send message to user
// @route   POST /api/moderator/messages
// @access  Private/Moderator
const sendMessageToUser = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }

  const { to, content } = req.body;

  // Validate input
  if (!to || !content) {
    res.status(400);
    throw new Error('Please provide recipient and message content');
  }

  try {
    // Create and save the message
    const message = new Message({
      from: req.user._id,
      to,
      content
    });

    const savedMessage = await message.save();
    
    // Populate the sender and recipient information
    await savedMessage.populate('from', 'fullName avatar role');
    await savedMessage.populate('to', 'fullName avatar role');
    
    // Emit message via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient
      io.emit('receive_message', savedMessage);
      
      // Emit to sender for confirmation
      io.emit('message_sent', savedMessage);
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500);
    throw new Error('Server error while sending message');
  }
});

// @desc    Get messages for moderator
// @route   GET /api/moderator/messages
// @access  Private/Moderator
const getModeratorMessages = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }

  try {
    // Fetch messages where the moderator is either sender or recipient
    const messages = await Message.find({
      $or: [
        { from: req.user._id },
        { to: req.user._id }
      ]
    })
    .populate('from', 'fullName avatar role')
    .populate('to', 'fullName avatar role')
    .sort({ timestamp: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500);
    throw new Error('Server error while fetching messages');
  }
});

module.exports = {
  getAllUsers,
  approvePost,
  deletePost,
  sendMessageToUser,
  getModeratorMessages
};