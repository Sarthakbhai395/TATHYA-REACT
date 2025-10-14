// tathya-backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Use built-in crypto.randomUUID when available to avoid ESM uuid package warnings
let uuidv4;
try {
  uuidv4 = () => crypto.randomUUID();
} catch (e) {
  // Fallback to uuid package if crypto.randomUUID is not available
  try {
    uuidv4 = require('uuid').v4;
  } catch (err) {
    // As a last resort, use timestamp/random
    uuidv4 = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

}


// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure 'uploads' directory exists and use absolute path
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uuidv4() + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (allow only certain types)
const fileFilter = (req, file, cb) => {
  // Allow pdf, jpg, jpeg, png, doc, docx and common video types
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  // Allow video/* mime types as well
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    // Reject file
    cb(new Error('Unsupported file format. Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX, and common video formats.'), false);
  }
};

// Initialize Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // Max file size 10MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;