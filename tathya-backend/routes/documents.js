const express = require('express');
const router = express.Router();
const {
	uploadDocument,
	getMyDocuments,
	getDocumentById,
	updateDocument,
	deleteDocument,
	downloadDocument,
	verifyDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected routes (document actions require authentication)
router.post('/', protect, upload.single('document'), uploadDocument);
router.get('/my-documents', protect, getMyDocuments);
router.get('/:id', protect, getDocumentById);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);
router.get('/:id/download', protect, downloadDocument);
router.put('/:id/verify', protect, verifyDocument); // Ideally restricted to moderators/admins

module.exports = router;
