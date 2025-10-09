// tathya-backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
  },
  category: {
    type: String,
    enum: ['Academic Pressure', 'Harassment', 'Discrimination', 'Unfair Treatment', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Review', 'Resolved', 'Closed'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  attachments: [
    {
      filename: String,
      path: String, // Path on server or URL if cloud storage
      mimetype: String,
      size: Number,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
  resolutionNotes: {
    type: String,
  },
  // Add fields for tracking/moderation if needed
});

module.exports = mongoose.model('Report', reportSchema);