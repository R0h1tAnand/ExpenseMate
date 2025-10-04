const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {String} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};