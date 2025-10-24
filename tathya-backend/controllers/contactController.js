// tathya-backend/controllers/contactController.js
const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Handle contact form submission (public)
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  try {
    // Find the first moderator user to send the message to
    const moderator = await User.findOne({ role: 'moderator' });
    
    if (!moderator) {
      res.status(500);
      throw new Error('No moderator found to receive the message');
    }

    // Create a special user entry for contact form submissions if it doesn't exist
    let contactUser = await User.findOne({ email: 'contact@tathya.edu' });
    
    if (!contactUser) {
      contactUser = new User({
        fullName: 'Contact Form User',
        email: 'contact@tathya.edu',
        password: 'contact123', // This won't be used for login
        role: 'user',
        isVerified: true
      });
      await contactUser.save();
    }

    // Create and save the message
    const contactMessage = new Message({
      from: contactUser._id,
      to: moderator._id,
      content: `Contact Form Submission:
      
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`
    });

    const savedMessage = await contactMessage.save();
    
    // Populate the sender and recipient information
    await savedMessage.populate('from', 'fullName email');
    await savedMessage.populate('to', 'fullName role');
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: savedMessage
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while sending message: ' + error.message);
  }
});

// @desc    Handle authenticated contact form submission
// @route   POST /api/contact/authenticated
// @access  Private
const submitAuthenticatedContactForm = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = req.user;

  // Validate input
  if (!subject || !message) {
    res.status(400);
    throw new Error('Please provide subject and message');
  }

  try {
    // Find the first moderator user to send the message to
    const moderator = await User.findOne({ role: 'moderator' });
    
    if (!moderator) {
      res.status(500);
      throw new Error('No moderator found to receive the message');
    }

    // Create and save the message
    const contactMessage = new Message({
      from: user._id,
      to: moderator._id,
      content: `Subject: ${subject}

Message:
${message}`
    });

    const savedMessage = await contactMessage.save();
    
    // Populate the sender and recipient information
    await savedMessage.populate('from', 'fullName email avatar role');
    await savedMessage.populate('to', 'fullName role');
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: savedMessage
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while sending message: ' + error.message);
  }
});

// @desc    Handle moderator response to contact form submission
// @route   POST /api/contact/respond
// @access  Private (Moderator only)
const respondToContactForm = asyncHandler(async (req, res) => {
  const { messageId, response } = req.body;
  const moderator = req.user;

  // Validate input
  if (!messageId || !response) {
    res.status(400);
    throw new Error('Please provide message ID and response');
  }

  try {
    // Find the original contact message
    const originalMessage = await Message.findById(messageId);
    
    if (!originalMessage) {
      res.status(404);
      throw new Error('Contact form submission not found');
    }

    // Verify that the original message was sent by the contact user or authenticated user
    const contactUser = await User.findOne({ email: 'contact@tathya.edu' });
    const isFromContactUser = contactUser && originalMessage.from.equals(contactUser._id);
    const isFromRegularUser = !isFromContactUser; // If not from contact user, it's from a regular user

    // Determine original sender (could be contact user or the actual user who submitted)
    let originalSender;
    if (isFromContactUser) {
      // For public contact forms, we need to find the actual user from the message content
      // In this case, we'll send the response to the contact user, and the frontend will handle routing
      originalSender = contactUser;
    } else {
      // For authenticated users, the sender is the user themselves
      originalSender = await User.findById(originalMessage.from);
      if (!originalSender) {
        res.status(400);
        throw new Error('Invalid contact form submission');
      }
    }

    // Create response message from moderator to original sender
    let responseContent;
    if (isFromContactUser) {
      // Extract subject from original message for public contact forms
      const lines = originalMessage.content.split('\n');
      const subjectLine = lines.find(line => line.includes('Subject:'));
      const originalSubject = subjectLine ? subjectLine.replace('Subject: ', '') : 'N/A';
      
      responseContent = `Response to your contact form submission:
      
Original Subject: ${originalSubject}

Response:
${response}`;
    } else {
      // For authenticated users, extract subject from their message
      const lines = originalMessage.content.split('\n');
      const subjectLine = lines.find(line => line.includes('Subject:'));
      const originalSubject = subjectLine ? subjectLine.replace('Subject: ', '') : 'N/A';
      
      responseContent = `Response to your contact form submission:
      
Original Subject: ${originalSubject}

Response:
${response}`;
    }

    const responseMessage = new Message({
      from: moderator._id,
      to: originalMessage.from, // Send response to the original sender
      content: responseContent
    });

    const savedResponse = await responseMessage.save();
    
    // Populate sender and recipient information
    await savedResponse.populate('from', 'fullName email avatar role');
    await savedResponse.populate('to', 'fullName email avatar role');
    
    res.status(201).json({
      message: 'Response sent successfully',
      data: savedResponse
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while sending response: ' + error.message);
  }
});

module.exports = {
  submitContactForm,
  submitAuthenticatedContactForm,
  respondToContactForm
};