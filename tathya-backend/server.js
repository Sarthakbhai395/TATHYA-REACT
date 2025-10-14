// tathya-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

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
const aboutRoutes = require('./routes/about');
const resumeRoutes = require('./routes/resume');
const activityRoutes = require('./routes/activities');
const notificationRoutes = require('./routes/notifications');
const moderatorRoutes = require('./routes/moderator');
const messageRoutes = require('./routes/messages');

// Import utility functions for error handling
const { notFound, errorHandler } = require('./utils/errorHandler');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// CORS configuration for REST API
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://localhost:3002',
].filter(Boolean);

// Apply CORS middleware to Express app
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Initialize Socket.IO with proper CORS configuration
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Register user
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  // Handle sending message
  socket.on('send_message', async (data) => {
    try {
      const { from, to, content } = data;
      
      // Save message to database
      const Message = require('./models/Message');
      const message = new Message({
        from,
        to,
        content
      });
      
      const savedMessage = await message.save();
      
      // Populate sender and recipient info
      await savedMessage.populate('from', 'fullName avatar role');
      await savedMessage.populate('to', 'fullName avatar role');
      
      // Emit message to recipient if online
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', savedMessage);
      }
      
      // Emit message to sender for confirmation
      const senderSocketId = connectedUsers.get(from);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_sent', savedMessage);
      }
      
      console.log('Message sent:', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Connect to MongoDB database
connectDB();

// --- Middleware Setup ---
// Security: Set various HTTP headers for protection
// Allow cross-origin embedding of static resources (uploads) so frontend on a different origin can display them.
app.use(
  helmet({
    // Allow images and other static resources to be fetched by cross-origin clients during development
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Body Parser: Parse incoming JSON and URL-encoded payloads
// Increase limits if you expect large file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically at /uploads
// Ensure uploads directory exists (prevents ENOENT when multer tries to save files)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

app.use('/uploads', express.static(uploadsDir));

// Ensure uploaded files can be embedded cross-origin (useful during local dev when front-end runs on a different origin)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

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

// Public about content
app.use('/api/about', aboutRoutes);

// Resume management routes
app.use('/api/resume', resumeRoutes);

// Activity tracking routes
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// Moderator routes
app.use('/api/moderator', moderatorRoutes);

// User messages routes
app.use('/api/messages', messageRoutes);

// --- Error Handling Middleware ---
// Catch 404 errors for undefined routes
app.use(notFound);

// Centralized error handler for all other errors
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Backend server listening on port ${PORT}`);
});