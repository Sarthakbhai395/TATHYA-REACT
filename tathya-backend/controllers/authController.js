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

  // Normalize and validate phone number for Indian format
  let normalizedPhone = phoneNumber.trim();
  
  // Handle Indian phone numbers
  if (normalizedPhone.startsWith('0')) {
    // Remove leading zero
    normalizedPhone = normalizedPhone.substring(1);
  }
  
  if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
    // It's already in international format without +
    normalizedPhone = `+${normalizedPhone}`;
  } else if (normalizedPhone.startsWith('+91') && normalizedPhone.length === 13) {
    // It's already in correct international format
    // Keep as is
  } else if (normalizedPhone.length === 10 && /^\d{10}$/.test(normalizedPhone)) {
    // It's a 10-digit Indian number, convert to international format
    normalizedPhone = `+91${normalizedPhone}`;
  } else if (!normalizedPhone.startsWith('+')) {
    // Add +91 prefix for Indian numbers without +
    normalizedPhone = `+91${normalizedPhone}`;
  }

  // Validate phone number format (supporting international format)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    res.status(400);
    throw new Error('Invalid phone number format. Please use a valid phone number (e.g., 9876543210 or +919876543210)');
  }

  // Generate a 6-digit verification code
  const verificationCode = crypto.randomInt(100000, 999999).toString();

  // Store the verification code temporarily
  verificationCodes[normalizedPhone] = verificationCode;

  // Check if we're in development mode and missing Twilio credentials
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasValidTwilioConfig = process.env.TWILIO_ACCOUNT_SID && 
                               process.env.TWILIO_AUTH_TOKEN && 
                               process.env.TWILIO_PHONE_NUMBER &&
                               process.env.TWILIO_ACCOUNT_SID.trim() !== '' &&
                               process.env.TWILIO_AUTH_TOKEN.trim() !== '' &&
                               process.env.TWILIO_PHONE_NUMBER.trim() !== '';

  // If we're in development and missing Twilio config, use fallback
  if (isDevelopment && !hasValidTwilioConfig) {
    console.warn('Twilio configuration is missing or incomplete. Using development fallback.');
    console.log(`[DEV MODE] Verification code for ${normalizedPhone}: ${verificationCode}`);
    return res.status(200).json({ 
      message: 'Verification code generated (check server logs in dev mode)',
      devCode: verificationCode
    });
  }

  // If we're in production and missing Twilio config, throw error
  if (!isDevelopment && !hasValidTwilioConfig) {
    console.error('Missing Twilio configuration in production environment');
    res.status(500);
    throw new Error('SMS service is currently unavailable. Please contact support.');
  }

  try {
    // Send message using Twilio (try WhatsApp first, fallback to SMS)
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Format WhatsApp number (whatsapp:+91XXXXXXXXXX)
    const whatsappNumber = `whatsapp:${normalizedPhone}`;
    const smsNumber = normalizedPhone;
    
    // Try WhatsApp first
    try {
      console.log(`Attempting to send WhatsApp message to ${whatsappNumber}`);
      await client.messages.create({
        body: `Your verification code is: ${verificationCode}\n\nThis message is from TATHYA App.`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: whatsappNumber,
      });
      console.log(`✅ Verification code sent via WhatsApp to ${normalizedPhone}`);
      return res.status(200).json({ 
        message: 'Verification code sent successfully via WhatsApp',
        method: 'whatsapp',
        devCode: isDevelopment ? verificationCode : undefined
      });
    } catch (whatsappError) {
      console.warn('⚠️ WhatsApp sending failed:', whatsappError.message);
      console.warn('Error code:', whatsappError.code);
      console.warn('Error status:', whatsappError.status);
      
      // Check if it's a WhatsApp-specific error
      if (whatsappError.code === 63016) {
        // WhatsApp requires users to opt-in first
        console.log('WhatsApp requires user opt-in. Sending SMS instead.');
        // Fallback to SMS
        await client.messages.create({
          body: `Your verification code is: ${verificationCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: smsNumber,
        });
        
        console.log(`✅ Verification code sent via SMS to ${normalizedPhone}`);
        return res.status(200).json({ 
          message: 'Verification SMS sent successfully (WhatsApp requires opt-in)',
          method: 'sms',
          devCode: isDevelopment ? verificationCode : undefined
        });
      } else {
        // Other WhatsApp error, try SMS
        console.log('Trying SMS fallback...');
        await client.messages.create({
          body: `Your verification code is: ${verificationCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: smsNumber,
        });
        
        console.log(`✅ Verification code sent via SMS to ${normalizedPhone}`);
        return res.status(200).json({ 
          message: 'Verification SMS sent successfully',
          method: 'sms',
          devCode: isDevelopment ? verificationCode : undefined
        });
      }
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    console.error('Twilio Error Code:', error.code);
    console.error('Twilio Error Status:', error.status);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages based on Twilio error codes
    if (error.code === 20003 || (error.status === 401 && error.message.includes('Authenticate'))) {
      // Twilio authentication error - provide a development fallback
      console.warn('Twilio authentication failed. Using development fallback.');
      console.log(`[DEV MODE] Verification code for ${normalizedPhone}: ${verificationCode}`);
      return res.status(200).json({ 
        message: 'Verification code generated (check server logs in dev mode)',
        devCode: isDevelopment ? verificationCode : undefined
      });
    } else if (error.code === 21211) {
      res.status(400);
      throw new Error('Failed to send verification message: Invalid phone number format.');
    } else if (error.status === 400) {
      res.status(400);
      throw new Error(`Failed to send verification message: ${error.message}`);
    } else {
      // For any other error, provide a fallback in development mode
      if (isDevelopment) {
        console.warn('Twilio error occurred. Using development fallback.');
        console.log(`[DEV MODE] Verification code for ${normalizedPhone}: ${verificationCode}`);
        return res.status(200).json({ 
          message: 'Verification code generated (check server logs in dev mode)',
          devCode: verificationCode
        });
      } else {
        res.status(500);
        throw new Error(`Failed to send verification message: ${error.message}`);
      }
    }
  }
});

const verifySmsCode = asyncHandler(async (req, res) => {
  let { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    res.status(400);
    throw new Error('Please provide phone number and verification code');
  }

  // Normalize phone number (same logic as in sendVerificationSms)
  phoneNumber = phoneNumber.trim();
  
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.substring(1);
  }
  
  if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
    phoneNumber = `+${phoneNumber}`;
  } else if (phoneNumber.startsWith('+91') && phoneNumber.length === 13) {
    // Keep as is
  } else if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
    phoneNumber = `+91${phoneNumber}`;
  } else if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+91${phoneNumber}`;
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
  let { phoneNumber, code, newPassword } = req.body;

  if (!phoneNumber || !code || !newPassword) {
    res.status(400);
    throw new Error('Please provide phone number, verification code, and new password');
  }

  // Normalize phone number (same logic as in sendVerificationSms)
  phoneNumber = phoneNumber.trim();
  
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.substring(1);
  }
  
  if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
    phoneNumber = `+${phoneNumber}`;
  } else if (phoneNumber.startsWith('+91') && phoneNumber.length === 13) {
    // Keep as is
  } else if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
    phoneNumber = `+91${phoneNumber}`;
  } else if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+91${phoneNumber}`;
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
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
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