const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCurrencies
} = require('../controllers/companyController');
const { authenticate, authorize, checkCompanyAccess } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createCompanyValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('defaultCurrency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters')
    .toUpperCase()
];

const updateCompanyValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid company ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('defaultCurrency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters')
    .toUpperCase()
];

const companyIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid company ID')
];

// Routes

/**
 * @route   GET /api/v1/companies
 * @desc    Get all companies
 * @access  Private (Admin only)
 */
router.get('/', 
  authenticate, 
  authorize(['ADMIN']), 
  getAllCompanies
);

/**
 * @route   GET /api/v1/companies/:id
 * @desc    Get company by ID
 * @access  Private (Admin or same company users)
 */
router.get('/:id', 
  companyIdValidation,
  handleValidation,
  authenticate, 
  checkCompanyAccess,
  getCompanyById
);

/**
 * @route   POST /api/v1/companies
 * @desc    Create new company
 * @access  Public (for signup process)
 */
router.post('/', 
  createCompanyValidation,
  handleValidation,
  createCompany
);

/**
 * @route   PUT /api/v1/companies/:id
 * @desc    Update company
 * @access  Private (Admin only)
 */
router.put('/:id', 
  updateCompanyValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  checkCompanyAccess,
  updateCompany
);

/**
 * @route   DELETE /api/v1/companies/:id
 * @desc    Delete company
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  companyIdValidation,
  handleValidation,
  authenticate, 
  authorize(['ADMIN']),
  checkCompanyAccess,
  deleteCompany
);

/**
 * @route   GET /api/v1/companies/utils/currencies
 * @desc    Get available currencies
 * @access  Public
 */
router.get('/utils/currencies', getCurrencies);

module.exports = router;