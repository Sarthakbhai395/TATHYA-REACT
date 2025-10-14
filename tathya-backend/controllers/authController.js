// tathya-backend/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const asyncHandler = require('express-async-handler');
const upload = require('../middleware/uploadMiddleware');
const twilio = require('twilio');
const crypto = require('crypto');

// Temporary store for verification codes (in a real app, use a database or Redis)
const verificationCodes = {};

const sendVerificationSms = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    res.status(400);
    throw new Error('Please provide a phone number');
  }

  // Check if user exists with the provided phone number
  // const user = await User.findOne({ phone: phoneNumber });
  // if (!user) {
  //   res.status(404);
  //   throw new Error('User not found with this phone number');
  // }

  // Generate a 6-digit verification code
  const verificationCode = crypto.randomInt(100000, 999999).toString();

  // Store the verification code temporarily
  verificationCodes[phoneNumber] = verificationCode;

  // Send SMS using Twilio
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    res.status(200).json({ message: 'Verification SMS sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500);
    throw new Error('Failed to send verification SMS');
  }
});

const verifySmsCode = asyncHandler(async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    res.status(400);
    throw new Error('Please provide phone number and verification code');
  }

  const storedCode = verificationCodes[phoneNumber];

  if (storedCode && storedCode === code) {
    // Code is valid, clear it from temporary storage
    delete verificationCodes[phoneNumber];
    res.status(200).json({ message: 'Verification code verified successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }
});

const resetPasswordViaSms = asyncHandler(async (req, res) => {
  const { phoneNumber, code, newPassword } = req.body;

  if (!phoneNumber || !code || !newPassword) {
    res.status(400);
    throw new Error('Please provide phone number, verification code, and new password');
  }

  const storedCode = verificationCodes[phoneNumber];

  if (storedCode && storedCode === code) {
    const user = await User.findOne({ phone: phoneNumber });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.password = newPassword; // Mongoose pre-save hook will hash this
    await user.save();

    delete verificationCodes[phoneNumber]; // Clear the verification code

    res.status(200).json({ message: 'Password reset successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }
});

// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const { role } = req.body;

  // Basic validation (you can add more)
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields (firstName, lastName, email, password)');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    fullName: `${firstName} ${lastName}`,
    email,
    password, // Password will be hashed by the pre-save middleware in User model
    role: role === 'moderator' ? 'moderator' : 'user',
    // Initialize other fields with defaults or empty values
    phone: '',
    location: '',
    university: '',
    degree: '',
    gradYear: '',
    skills: '',
    summary: '',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      aadharVerified: user.aadharVerified,
        role: user.role,
        token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  console.log('Attempting login...');
  const { email, password } = req.body;
  console.log(`Received email: ${email}, password: ${password ? '[PROVIDED]' : '[NOT PROVIDED]'}`);

  // Basic validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ email });
  console.log('User found:', user ? user.email : 'None');

  if (user && (await user.matchPassword(password))) {
    console.log('Password matched. Generating token...');
    const token = generateToken(user._id);
    console.log('Token generated:', token ? '[GENERATED]' : '[FAILED]');
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      aadharVerified: user.aadharVerified,
      role: user.role,
      token: token,
    });
  } else {
    console.log('Invalid email or password.');
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user (invalidate token on frontend)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is typically handled on the frontend by clearing the token.
  // This endpoint can be used for server-side invalidation if needed (e.g., using a blacklist).
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password'); // Exclude password

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields provided in the request body
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.university = req.body.university || user.university;
    user.degree = req.body.degree || user.degree;
    user.gradYear = req.body.gradYear || user.gradYear;
    user.skills = req.body.skills || user.skills;
    user.summary = req.body.summary || user.summary;
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      location: updatedUser.location,
      university: updatedUser.university,
      degree: updatedUser.degree,
      gradYear: updatedUser.gradYear,
      skills: updatedUser.skills,
      summary: updatedUser.summary,
      isVerified: updatedUser.isVerified,
      aadharVerified: updatedUser.aadharVerified,
      token: generateToken(updatedUser._id), // Optionally regenerate token
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  sendVerificationSms,
  verifySmsCode,
  resetPasswordViaSms,
};