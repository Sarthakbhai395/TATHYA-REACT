// tathya-backend/models/Community.js
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    unique: true,
    trim: true,
  },
  region: {
    type: String,
    required: [true, 'Community region is required'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  moderators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  tags: [String], // Array of tags
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Add fields for community rules, image URL, etc. if needed
});

module.exports = mongoose.model('Community', communitySchema);