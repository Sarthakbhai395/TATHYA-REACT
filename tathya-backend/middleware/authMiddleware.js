const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Not authorized, invalid token signature');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized, token expired');
      } else {
        throw new Error('Not authorized, token failed');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  console.log('Inside optionalProtect middleware');
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User populated in optionalProtect:', req.user ? req.user.id : 'No user');
    } catch (error) {
      console.error('Error in optionalProtect (token verification failed):', error.message);
      // Optionally, you might want to clear the token or handle it differently
    }
  }
  console.log('Exiting optionalProtect middleware');
  next();
});

module.exports = { protect, optionalProtect };