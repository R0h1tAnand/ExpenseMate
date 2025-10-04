const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignManager,
  changeRole,
  getSubordinates
} = require('../controllers/userController');
const { authenticate, authorize, checkResourceAccess } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
    .withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('managerId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Use a simple UUID pattern check
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(value)) {
        throw new Error('Manager ID must be a valid UUID');
      }
      return true;
    })
];

const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
    .withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('managerId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Use a simple UUID pattern check
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(value)) {
        throw new Error('Manager ID must be a valid UUID');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const userIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID')
];

const assignManagerValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Manager ID must be a valid UUID')
];

const changeRoleValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
    .withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE')
];

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin/Manager)
 */
router.get('/', 
  authenticate, 
  authorize(['ADMIN', 'MANAGER']), 
  getAllUsers
);

/**
 * @route   GET /api/v1/users/subordinates
 * @desc    Get subordinates (Manager only)
 * @access  Private (Manager)
 */
router.get('/subordinates', 
  authenticate, 
  authorize(['MANAGER']), 
  getSubordinates
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or self)
 */
router.get('/:id', 
  userIdValidation,
  handleValidation,
  authenticate, 
  checkResourceAccess('user'),
  getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', 
  createUserValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin or self for limited fields)
 */
router.put('/:id', 
  updateUserValidation,
  handleValidation,
  authenticate, 
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  userIdValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  deleteUser
);

/**
 * @route   PATCH /api/v1/users/:id/manager
 * @desc    Assign manager to user
 * @access  Private (Admin only)
 */
router.patch('/:id/manager', 
  assignManagerValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  assignManager
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin only)
 */
router.patch('/:id/role', 
  changeRoleValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  changeRole
);

module.exports = router;