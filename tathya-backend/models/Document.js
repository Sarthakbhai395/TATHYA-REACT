// tathya-backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  type: {
    type: String, // e.g., 'PDF', 'JPG'
    required: true,
  },
  size: {
    type: String, // e.g., '2.5 MB'
    required: true,
  },
  path: {
    type: String, // Path on server or URL if cloud storage
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  // Add fields for verification details if needed
});

module.exports = mongoose.model('Document', documentSchema);