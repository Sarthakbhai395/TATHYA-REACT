// tathya-backend/routes/contact.js
const express = require('express');
const router = express.Router();
const { submitContactForm, submitAuthenticatedContactForm, respondToContactForm } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Public contact form submission route
router.post('/', submitContactForm);

// Authenticated contact form submission route
router.post('/authenticated', protect, submitAuthenticatedContactForm);

// Moderator response to contact form submission
router.post('/respond', protect, respondToContactForm);

module.exports = router;