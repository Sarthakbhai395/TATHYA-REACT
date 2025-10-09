// tathya-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Import database connection function
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const documentRoutes = require('./routes/documents');
const communityRoutes = require('./routes/communities');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
// Import other routes as you create them
// const userRoutes = require('./routes/users');
// const notificationRoutes = require('./routes/notifications');

// Import utility functions for error handling
const { notFound, errorHandler } = require('./utils/errorHandler');

const app = express();

// Connect to MongoDB database
connectDB();

// --- Middleware Setup ---
// Security: Set various HTTP headers for protection
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing (configure origin for production)
// Allow frontend (Vite dev server) to access backend during development
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Logger: Log HTTP requests (use 'dev' for concise output in development)
app.use(morgan('combined'));

// Body Parser: Parse incoming JSON and URL-encoded payloads
// Increase limits if you expect large file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files (e.g., uploaded documents, if stored locally)
// Make sure the 'uploads' directory exists
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Route Definitions ---
// Mount authentication routes under /api/auth
app.use('/api/auth', authRoutes);

// Mount report routes under /api/reports
app.use('/api/reports', reportRoutes);

// Mount document routes under /api/documents
app.use('/api/documents', documentRoutes);

// Mount community routes under /api/communities
app.use('/api/communities', communityRoutes);

// Mount post routes under /api/posts
app.use('/api/posts', postRoutes);
// Chat (AI) endpoint (simple echo + persistence)
// Expose under /api/chat so frontend can use API_BASE + '/chat'
app.use('/api/chat', chatRoutes);

// Mount other routes as needed
// app.use('/api/users', userRoutes);
// app.use('/api/notifications', notificationRoutes);

// --- Error Handling Middleware ---
// Catch 404 errors for undefined routes
app.use(notFound);

// Centralized error handler for all other errors
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});