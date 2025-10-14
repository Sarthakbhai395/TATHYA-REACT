const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['Created', 'Updated', 'Deleted', 'Uploaded', 'Downloaded', 'Reported', 'Viewed']
  },
  item: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
activitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
