// tathya-backend/controllers/documentController.js
const Document = require('../models/Document');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const fs = require('fs'); // For file system operations
const path = require('path'); // For path manipulation

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  // Multer middleware (upload.single('document')) should populate req.file
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const { name, type } = req.body; // Get document name and type from form data

  // Basic validation
  if (!name || !type) {
    // Clean up uploaded file if validation fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path); // Delete the file
    }
    res.status(400);
    throw new Error('Please provide document name and type');
  }

  // Create document record
  const document = new Document({
    userId: req.user._id,
    name: name.trim(),
    type: type.toUpperCase(),
    size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to MB
    path: req.file.path, // Path where file is stored on server
    // status will default to 'Pending' as defined in the schema
  });

  const createdDocument = await document.save();

  if (createdDocument) {
    res.status(201).json({
      _id: createdDocument._id,
      name: createdDocument.name,
      type: createdDocument.type,
      size: createdDocument.size,
      uploadedAt: createdDocument.uploadedAt,
      status: createdDocument.status,
      // Do NOT send the file path back to the frontend for security
    });
  } else {
    // Clean up uploaded file if DB save fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400);
    throw new Error('Invalid document data');
  }
});

// @desc    Get all documents for the logged-in user
// @route   GET /api/documents/my-documents
// @access  Private
const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
  res.json(documents);
});

// @desc    Get a single document by ID (metadata only)
// @route   GET /api/documents/:id
// @access  Private (user owns document)
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document) {
    // Check ownership
    if (document.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this document');
    }
    res.json(document);
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Update document metadata (e.g., name, type)
// @route   PUT /api/documents/:id
// @access  Private (user owns document)
const updateDocument = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  const document = await Document.findById(req.params.id);

  if (document) {
    // Check ownership
    if (document.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this document');
    }

    document.name = name || document.name;
    document.type = type || document.type;
    // Note: Updating size, path, or uploadedAt is generally not allowed

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (user owns document)
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document) {
    // Check ownership
    if (document.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this document');
    }

    // Delete the file from the filesystem
    if (document.path && fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.remove();
    res.json({ message: 'Document removed' });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private (user owns document)
const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document) {
    // Check ownership
    if (document.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to download this document');
    }

    // Check if file exists
    if (!document.path || !fs.existsSync(document.path)) {
      res.status(404);
      throw new Error('Document file not found on server');
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}.${document.type.toLowerCase()}"`);
    res.setHeader('Content-Type', 'application/octet-stream'); // Generic binary type

    // Stream the file
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ message: 'Error downloading file' });
    });

    res.on('finish', () => {
      console.log(`Document ${document.name} downloaded successfully by user ${req.user._id}`);
    });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Verify a document (typically done by admin/moderator)
// @route   PUT /api/documents/:id/verify
// @access  Private/Admin or Moderator
const verifyDocument = asyncHandler(async (req, res) => {
  const { status } = req.body; // Expected: 'Verified' or 'Rejected'

  const document = await Document.findById(req.params.id);

  if (document) {
    // In a real app, check if user is admin/moderator
    // if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    //   res.status(401);
    //   throw new Error('Not authorized to verify documents');
    // }

    if (status !== 'Verified' && status !== 'Rejected') {
      res.status(400);
      throw new Error('Invalid verification status. Must be "Verified" or "Rejected".');
    }

    document.status = status;
    const updatedDocument = await document.save();

    res.json({
      message: `Document ${status.toLowerCase()}`,
      document: updatedDocument,
    });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  verifyDocument,
};