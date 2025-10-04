const express = require('express');
const { body, param } = require('express-validator');
const {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowTemplates
} = require('../controllers/workflowController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createWorkflowValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Workflow name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('rules')
    .isObject()
    .withMessage('Rules must be a valid object'),
  body('rules.type')
    .isIn(['sequential', 'percentage', 'specific', 'hybrid'])
    .withMessage('Rules type must be sequential, percentage, specific, or hybrid')
];

const updateWorkflowValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid workflow ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Workflow name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('rules')
    .optional()
    .isObject()
    .withMessage('Rules must be a valid object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const workflowIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid workflow ID')
];

/**
 * @route   GET /api/v1/workflows
 * @desc    Get all approval workflows
 * @access  Private (Admin/Manager)
 */
router.get('/', 
  authenticate, 
  authorize(['ADMIN', 'MANAGER']), 
  getWorkflows
);

/**
 * @route   GET /api/v1/workflows/templates
 * @desc    Get workflow templates/examples
 * @access  Private (Admin)
 */
router.get('/templates', 
  authenticate, 
  authorize(['ADMIN']), 
  getWorkflowTemplates
);

/**
 * @route   GET /api/v1/workflows/:id
 * @desc    Get workflow by ID
 * @access  Private (Admin/Manager)
 */
router.get('/:id', 
  workflowIdValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN', 'MANAGER']), 
  getWorkflowById
);

/**
 * @route   POST /api/v1/workflows
 * @desc    Create new workflow
 * @access  Private (Admin only)
 */
router.post('/', 
  createWorkflowValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  createWorkflow
);

/**
 * @route   PUT /api/v1/workflows/:id
 * @desc    Update workflow
 * @access  Private (Admin only)
 */
router.put('/:id', 
  updateWorkflowValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  updateWorkflow
);

/**
 * @route   DELETE /api/v1/workflows/:id
 * @desc    Delete workflow
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  workflowIdValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  deleteWorkflow
);

module.exports = router;