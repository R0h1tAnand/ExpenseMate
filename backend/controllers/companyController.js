const { Company, User } = require('../models');
const { sendSuccess, sendCreated, sendError, sendNotFound } = require('../utils/response');
const { getAvailableCurrencies } = require('../utils/currency');

/**
 * Get all companies (Admin only)
 */
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: User,
          as: 'employees',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'role', 'isActive']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return sendSuccess(res, 'Companies retrieved successfully', companies);
  } catch (error) {
    console.error('Get companies error:', error);
    return sendError(res, 500, 'Failed to retrieve companies');
  }
};

/**
 * Get company by ID
 */
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findByPk(id, {
      include: [
        {
          model: User,
          as: 'employees',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'role', 'isActive']
        }
      ]
    });

    if (!company) {
      return sendNotFound(res, 'Company not found');
    }

    return sendSuccess(res, 'Company retrieved successfully', company);
  } catch (error) {
    console.error('Get company error:', error);
    return sendError(res, 500, 'Failed to retrieve company');
  }
};

/**
 * Create new company
 */
const createCompany = async (req, res) => {
  try {
    const { name, defaultCurrency } = req.body;

    // Validate currency
    const availableCurrencies = await getAvailableCurrencies();
    if (!availableCurrencies.includes(defaultCurrency)) {
      return sendError(res, 400, 'Invalid currency code');
    }

    const company = await Company.create({
      name,
      defaultCurrency
    });

    return sendCreated(res, 'Company created successfully', {
      companyId: company.companyId,
      name: company.name,
      defaultCurrency: company.defaultCurrency,
      createdAt: company.createdAt
    });
  } catch (error) {
    console.error('Create company error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Company name already exists');
    }
    
    return sendError(res, 500, 'Failed to create company');
  }
};

/**
 * Update company
 */
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, defaultCurrency } = req.body;

    const company = await Company.findByPk(id);
    
    if (!company) {
      return sendNotFound(res, 'Company not found');
    }

    // Validate currency if provided
    if (defaultCurrency) {
      const availableCurrencies = await getAvailableCurrencies();
      if (!availableCurrencies.includes(defaultCurrency)) {
        return sendError(res, 400, 'Invalid currency code');
      }
    }

    await company.update({
      ...(name && { name }),
      ...(defaultCurrency && { defaultCurrency })
    });

    return sendSuccess(res, 'Company updated successfully', {
      companyId: company.companyId,
      name: company.name,
      defaultCurrency: company.defaultCurrency,
      updatedAt: company.updatedAt
    });
  } catch (error) {
    console.error('Update company error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Company name already exists');
    }
    
    return sendError(res, 500, 'Failed to update company');
  }
};

/**
 * Delete company
 */
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);
    
    if (!company) {
      return sendNotFound(res, 'Company not found');
    }

    await company.destroy();

    return sendSuccess(res, 'Company deleted successfully');
  } catch (error) {
    console.error('Delete company error:', error);
    return sendError(res, 500, 'Failed to delete company');
  }
};

/**
 * Get available currencies
 */
const getCurrencies = async (req, res) => {
  try {
    const currencies = await getAvailableCurrencies();
    return sendSuccess(res, 'Currencies retrieved successfully', currencies);
  } catch (error) {
    console.error('Get currencies error:', error);
    return sendError(res, 500, 'Failed to retrieve currencies');
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCurrencies
};