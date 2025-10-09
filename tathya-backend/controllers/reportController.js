// tathya-backend/controllers/reportController.js
const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const report = new Report({
    userId: req.user._id, // Get user ID from authenticated request
    title,
    description,
    category: category || 'Other',
    priority: priority || 'Medium',
    // Handle attachments if uploaded via middleware
    attachments: req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    })) : [],
  });

  const createdReport = await report.save();
  res.status(201).json(createdReport);
});

// @desc    Get reports for the logged-in user
// @route   GET /api/reports/my-reports
// @access  Private
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ userId: req.user._id }).sort({ submittedAt: -1 });
  res.json(reports);
});

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (user owns report or is admin/moderator)
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (report) {
    // Check ownership or authorization (admin/moderator check omitted for brevity)
    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this report');
    }
    res.json(report);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Update a report (limited, e.g., add comment)
// @route   PUT /api/reports/:id
// @access  Private (user owns report or is admin/moderator)
const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (report) {
    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this report');
    }
    // Example: Update resolution notes (typically done by moderators)
    report.resolutionNotes = req.body.resolutionNotes || report.resolutionNotes;
    // Example: Update status (typically done by moderators)
    report.status = req.body.status || report.status;
    if (req.body.status === 'Resolved' && !report.resolvedAt) {
      report.resolvedAt = Date.now();
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (user owns report or is admin)
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (report) {
    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this report');
    }
    await report.remove();
    res.json({ message: 'Report removed' });
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport,
};