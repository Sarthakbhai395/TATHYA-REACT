// tathya-backend/utils/jwtUtils.js
const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given user ID.
 * @param {String} userId - The MongoDB ObjectId of the user.
 * @returns {String} - The signed JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * Verifies a JWT token.
 * @param {String} token - The JWT token to verify.
 * @returns {Object|null} - The decoded payload if valid, null otherwise.
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};