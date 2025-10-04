const { validationResult } = require('express-validator');
const { sendValidationError, sendUnauthorized, sendError } = require('../utils/response');

/**
 * Middleware to handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return sendValidationError(res, 'Validation failed', formattedErrors);
  }
  
  next();
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return sendValidationError(res, 'Database validation failed', errors);
  }
  
  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return sendValidationError(res, `${field} already exists`, err.errors);
  }
  
  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendValidationError(res, 'Invalid reference to related resource');
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendUnauthorized(res, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return sendUnauthorized(res, 'Token expired');
  }
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendValidationError(res, 'File too large');
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendValidationError(res, 'Unexpected file field');
  }
  
  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware to handle 404 errors
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  handleValidation,
  errorHandler,
  notFound
};