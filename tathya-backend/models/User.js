// tathya-backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  avatar: {
    type: String, // URL to avatar image
    default: 'https://randomuser.me/api/portraits/men/32.jpg', // Default avatar
  },
  phone: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  university: {
    type: String,
    trim: true,
  },
  degree: {
    type: String,
    trim: true,
  },
  gradYear: {
    type: String, // Or Number if you prefer
    trim: true,
  },
  skills: {
    type: String, // Comma-separated list or array of strings
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'moderator'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  aadharVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);