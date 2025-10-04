const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/v1/test/email
 * @desc    Test email configuration
 * @access  Private (Admin only)
 */
router.post('/email', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const testResult = await emailService.testConnection();
    
    if (testResult) {
      return sendSuccess(res, 'Email service connection successful');
    } else {
      return sendError(res, 500, 'Email service connection failed');
    }
  } catch (error) {
    console.error('Email test error:', error);
    return sendError(res, 500, 'Failed to test email service', error.message);
  }
});

module.exports = router;