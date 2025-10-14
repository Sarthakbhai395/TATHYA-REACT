const Resume = require('../models/Resume');
const User = require('../models/User');

// Get user's resume data
const getUserResume = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let resume = await Resume.findOne({ user: userId });
    
    if (!resume) {
      // Create default resume if none exists
      const user = await User.findById(userId);
      resume = new Resume({
        user: userId,
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user ? user.email : '',
        phone: user ? user.phone : '',
        summary: 'Motivated professional seeking opportunities...',
        experience: [],
        education: [],
        skills: [],
        template: 'modern'
      });
      await resume.save();
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Failed to fetch resume data' });
  }
};

// Save user's resume data
const saveUserResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeData = req.body;
    
    let resume = await Resume.findOne({ user: userId });
    
    if (resume) {
      // Update existing resume
      Object.assign(resume, resumeData);
      await resume.save();
    } else {
      // Create new resume
      resume = new Resume({
        user: userId,
        ...resumeData
      });
      await resume.save();
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ message: 'Failed to save resume data' });
  }
};

// Update user's resume data
const updateUserResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, upsert: true }
    );
    
    res.json(resume);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Failed to update resume data' });
  }
};

// Delete user's resume data
const deleteUserResume = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Resume.findOneAndDelete({ user: userId });
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Failed to delete resume data' });
  }
};

module.exports = {
  getUserResume,
  saveUserResume,
  updateUserResume,
  deleteUserResume
};
