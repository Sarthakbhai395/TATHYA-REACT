// tathya-backend/controllers/messageController.js
const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc    Get messages for current user
// @route   GET /api/messages
// @access  Private
const getUserMessages = asyncHandler(async (req, res) => {
  try {
    // Fetch messages where the user is either sender or recipient
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

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
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

module.exports = {
  getUserMessages,
  sendMessage
};