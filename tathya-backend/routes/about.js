const express = require('express');
const router = express.Router();
const { getAbout } = require('../controllers/aboutController');

// Public about content
router.get('/', getAbout);

module.exports = router;
