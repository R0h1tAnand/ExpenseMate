const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('defaultCurrency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters')
    .toUpperCase(),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Company signup with admin creation
 * @access  Public
 */
router.post('/signup', 
  signupValidation,
  handleValidation,
  signup
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', 
  loginValidation,
  handleValidation,
  login
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', 
  authenticate,
  getProfile
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  updateProfileValidation,
  handleValidation,
  authenticate,
  updateProfile
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', 
  changePasswordValidation,
  handleValidation,
  authenticate,
  changePassword
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', 
  refreshTokenValidation,
  handleValidation,
  refreshToken
);

module.exports = router;