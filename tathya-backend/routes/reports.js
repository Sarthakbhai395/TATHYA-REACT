// tathya-backend/routes/reports.js
const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

// Apply protect middleware to all routes in this file
router.use(protect);

// POST /api/reports - Create a new report (with optional file uploads)
router.post('/', upload.array('attachments', 5), createReport); // Allow up to 5 attachments

// GET /api/reports/my-reports - Get reports for the logged-in user
router.get('/my-reports', getMyReports);

// GET /api/reports/:id - Get a single report by ID
router.get('/:id', getReportById);

// PUT /api/reports/:id - Update a report
router.put('/:id', updateReport);

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', deleteReport);

module.exports = router;