const { verifyToken } = require('../utils/jwt');
const { User, Company } = require('../models');
const { sendUnauthorized, sendForbidden, sendError, sendNotFound } = require('../utils/response');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is required');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return sendUnauthorized(res, 'Access token is required');
    }
    
    const decoded = verifyToken(token);
    
    // Fetch user with company details
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['companyId', 'name', 'defaultCurrency']
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return sendUnauthorized(res, 'Invalid token - user not found');
    }
    
    if (!user.isActive) {
      return sendUnauthorized(res, 'Account is deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    console.error('Authentication error:', error);
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to authorize user roles
 * @param {Array<String>} roles - Allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return sendForbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
    }
    
    next();
  };
};

/**
 * Middleware to check if user belongs to the same company
 */
const checkCompanyAccess = (req, res, next) => {
  const { companyId } = req.params;
  
  if (companyId && req.user.companyId !== companyId) {
    return sendForbidden(res, 'Access denied - different company');
  }
  
  next();
};

/**
 * Middleware to check if user can access specific resource
 * @param {String} resourceType - Type of resource (expense, user, etc.)
 */
const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.expenseId || req.params.userId;
      
      if (!resourceId) {
        return next();
      }
      
      switch (resourceType) {
        case 'expense':
          const { Expense } = require('../models');
          const expense = await Expense.findByPk(resourceId, {
            include: [{
              model: User,
              as: 'submittedBy',
              attributes: ['userId', 'companyId']
            }]
          });
          
          if (!expense) {
            return sendNotFound(res, 'Expense not found');
          }
          
          // Admin can access all expenses in their company
          if (req.user.role === 'ADMIN' && expense.submittedBy.companyId === req.user.companyId) {
            return next();
          }
          
          // User can access their own expenses
          if (expense.submittedById === req.user.userId) {
            return next();
          }
          
          // Manager can access subordinates' expenses
          if (req.user.role === 'MANAGER') {
            const subordinate = await User.findOne({
              where: { userId: expense.submittedById, managerId: req.user.userId }
            });
            if (subordinate) {
              return next();
            }
          }
          
          return sendForbidden(res, 'Access denied to this expense');
          
        case 'user':
          if (req.user.role === 'ADMIN') {
            return next();
          }
          
          if (resourceId === req.user.userId) {
            return next();
          }
          
          return sendForbidden(res, 'Access denied to this user');
          
        default:
          return next();
      }
    } catch (error) {
      console.error('Resource access check error:', error);
      return sendError(res, 500, 'Error checking resource access');
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkCompanyAccess,
  checkResourceAccess
};