/**
 * Standard API response format
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: statusCode < 400,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
const sendSuccess = (res, message = 'Success', data = null, meta = null) => {
  return sendResponse(res, 200, message, data, meta);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
const sendCreated = (res, message = 'Created successfully', data = null) => {
  return sendResponse(res, 201, message, data);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Detailed errors
 */
const sendError = (res, statusCode = 500, message = 'Internal server error', errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Object} errors - Validation errors
 */
const sendValidationError = (res, message = 'Validation failed', errors = null) => {
  return sendError(res, 400, message, errors);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

/**
 * Paginate results
 * @param {Object} options - Pagination options
 * @param {Number} options.page - Current page
 * @param {Number} options.limit - Items per page
 * @param {Number} totalCount - Total count of items
 * @returns {Object} Pagination metadata
 */
const paginate = ({ page = 1, limit = 10 }, totalCount) => {
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: totalCount,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    offset,
    limit: parseInt(limit)
  };
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  paginate
};