const express = require('express');
const { body, param } = require('express-validator');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getPendingApprovals
} = require('../controllers/expenseController');
const { authenticate, authorize, checkResourceAccess } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createExpenseValidation = [
  body('description')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Description must be between 5 and 255 characters'),
  body('category')
    .isIn(['TRAVEL', 'ACCOMMODATION', 'MEALS', 'TRANSPORTATION', 'OFFICE_SUPPLIES', 'EQUIPMENT', 'SOFTWARE', 'TRAINING', 'MARKETING', 'ENTERTAINMENT', 'OTHER'])
    .withMessage('Invalid category'),
  body('originalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('originalCurrency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('expenseDate')
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updateExpenseValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid expense ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Description must be between 5 and 255 characters'),
  body('category')
    .optional()
    .isIn(['TRAVEL', 'ACCOMMODATION', 'MEALS', 'TRANSPORTATION', 'OFFICE_SUPPLIES', 'EQUIPMENT', 'SOFTWARE', 'TRAINING', 'MARKETING', 'ENTERTAINMENT', 'OTHER'])
    .withMessage('Invalid category'),
  body('originalAmount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('originalCurrency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const expenseIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid expense ID')
];

const submitExpenseValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid expense ID'),
  body('workflowId')
    .isUUID()
    .withMessage('Workflow ID is required and must be valid')
];

const approveRejectValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid expense ID'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
];

/**
 * @route   GET /api/v1/expenses
 * @desc    Get expenses (filtered by user role)
 * @access  Private
 */
router.get('/', 
  authenticate, 
  getExpenses
);

/**
 * @route   GET /api/v1/expenses/pending
 * @desc    Get pending approvals for current user
 * @access  Private (Manager/Admin)
 */
router.get('/pending', 
  authenticate, 
  authorize(['MANAGER', 'ADMIN']), 
  getPendingApprovals
);

/**
 * @route   GET /api/v1/expenses/:id
 * @desc    Get expense by ID
 * @access  Private
 */
router.get('/:id', 
  expenseIdValidation,
  handleValidation,
  authenticate, 
  checkResourceAccess('expense'),
  getExpenseById
);

/**
 * @route   POST /api/v1/expenses
 * @desc    Create new expense
 * @access  Private (Employee/Manager/Admin)
 */
router.post('/', 
  createExpenseValidation,
  handleValidation,
  authenticate, 
  createExpense
);

/**
 * @route   PUT /api/v1/expenses/:id
 * @desc    Update expense (only in DRAFT status)
 * @access  Private (Owner only)
 */
router.put('/:id', 
  updateExpenseValidation,
  handleValidation,
  authenticate, 
  updateExpense
);

/**
 * @route   POST /api/v1/expenses/:id/submit
 * @desc    Submit expense for approval
 * @access  Private (Owner only)
 */
router.post('/:id/submit', 
  submitExpenseValidation,
  handleValidation,
  authenticate, 
  submitExpense
);

/**
 * @route   POST /api/v1/expenses/:id/approve
 * @desc    Approve expense
 * @access  Private (Manager/Admin)
 */
router.post('/:id/approve', 
  approveRejectValidation,
  handleValidation,
  authenticate, 
  authorize(['MANAGER', 'ADMIN']), 
  approveExpense
);

/**
 * @route   POST /api/v1/expenses/:id/reject
 * @desc    Reject expense
 * @access  Private (Manager/Admin)
 */
router.post('/:id/reject', 
  approveRejectValidation,
  handleValidation,
  authenticate, 
  authorize(['MANAGER', 'ADMIN']), 
  rejectExpense
);

module.exports = router;