// tathya-backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
  },
  attachments: [
    {
      filename: String,
      path: String, // Path on server or URL if cloud storage
      mimetype: String,
      size: Number,
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      replies: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          content: {
            type: String,
            required: true,
            trim: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          likes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
          ],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isAnonymous: {
    type: Boolean,
    default: true, // Posts are anonymous by default
  },
  isVisible: {
    type: Boolean,
    default: true, // Admin/moderator can hide posts if necessary
  },
});

// Middleware to update `updatedAt` on save
postSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);