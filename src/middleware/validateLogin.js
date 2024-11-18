const { loginValidation } = require('../../src/validators/validators');
const { sendResponse } = require('../../src/helpers/helper');

// Middleware for validation
const validateLogin = (req, res, next) => {
  const schema = loginValidation(req.originalUrl); // Get schema based on URL
  const { error } = schema.validate(req.body);
  if (error) return sendResponse(res, 400, false, error.details[0].message);
  next(); // Proceed to the next middleware or controller
};

module.exports = validateLogin;
