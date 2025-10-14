const Activity = require('../models/Activity');

// Get user's activities
const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 activities
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

// Create new activity
const createActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, item, details } = req.body;
    
    const activity = new Activity({
      user: userId,
      action,
      item,
      details,
      timestamp: new Date()
    });
    
    await activity.save();
    
    res.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    
    const activity = await Activity.findOneAndDelete({
      _id: activityId,
      user: userId
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Failed to delete activity' });
  }
};

module.exports = {
  getUserActivities,
  createActivity,
  deleteActivity
};
