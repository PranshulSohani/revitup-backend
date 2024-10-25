// src/helpers/helper.js

/**
 * Standardizes the API response format.
 * 
 * @param {Object} res - The response object from Express.
 * @param {Number} statusCode - The HTTP status code.
 * @param {Boolean} success - Indicates whether the response is successful.
 * @param {String} message - A message to return in the response.
 * @param {Object} [data] - Optional data to include in the response.
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    status: success,
    message,
    ...(data && { data }), // Conditionally include data if it's provided
  };

  return res.status(statusCode).json(response);
};

/**
 * Handles errors and sends an appropriate response based on the error type.
 * 
 * @param {Object} error - The error object.
 * @param {Object} res - The response object from Express.
 */
const handleError = (error, res) => {
  if (error.code && error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue)[0];
    return sendResponse(res, 400, false, `${duplicateField} must be unique.`);
  }

  if (error.isJoi) {
    return sendResponse(res, 400, false, error.details.map(detail => detail.message).join(", "));
  }

  if (error.name === 'ValidationError') {
    return sendResponse(res, 400, false, Object.values(error.errors).map(err => err.message).join(", "));
  }

  console.error(error);
  return sendResponse(res, 500, false, "An internal server error occurred. Please try again later.");
};

module.exports = {
  sendResponse,
  handleError,
};
