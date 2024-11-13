const joi = require('joi');
const User = require("../../src/models/User");

// Async function to check if the full name is unique
const isUniqueField = async (key,value) => {
    const user = await User.findOne({ key: value });
    return !user; // Return true if no user is found, meaning the name is unique
};

const registerValidation = joi.object({
  full_name: joi.string().pattern(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/) 
  // Allows names like "John Doe" or "Jane Mary Doe"
  .required().messages({
    "string.empty": "Full name is required.",
    "any.required": "Full name is required.",
    "string.pattern.base": "Full name must contain only letters and can include spaces between first, middle, and last name.",
  }),
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required."
  }),
  mobile_number: joi.string().pattern(/^\+91[0-9]{10}$/).required().messages({
    "string.empty": "Mobile number is required.",
    "string.pattern.base": "Mobile number must start with '+91' and be followed by 10 digits.",
    "any.required": "Mobile number is required."
  })
  .custom(async (value, helpers) => {
    const isUnique = await isUniqueField('mobile_number', value);
    if (!isUnique) {
      return helpers.message("Mobile number must be unique.");
    }
    return value; // return the value if it is valid
  })
  
  ,
  designation: joi.string().required().messages({
    "string.empty": "Designation is required.",
    "any.required": "Designation is required."
  }),
  role_id: joi.number()
  .valid(2,3,4,5,6,7,8) // Allowed values for role_id
  .required()
  .messages({
    "number.base": "Role ID must be a number.",
    "any.required": "Role ID is required.",
    "any.only": "Role ID must be one of the following:2,3,4,5,6,7,8."
  }),
  password: joi.string()
  .min(8) // Minimum length of 8 characters
  .pattern(/[A-Z]/) // At least one uppercase letter
  .pattern(/[a-z]/) // At least one lowercase letter
  .pattern(/[0-9]/) // At least one number
  .pattern(/[@$!%*?&]/) // At least one special character
  .required()
  .messages({
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&).",
    "any.required": "Password is required."
  }),
  confirm_password: joi.string().valid(joi.ref('password')).required().messages({
    "any.only": "Confirm password must match the password.",
    "string.empty": "Confirm password cannot be empty.",
    "any.required": "Confirm password is required."
  })
});

const loginValidation = joi.object({
  username: joi.string().required().messages({
    "string.empty": "Username is required.",
    "any.required": "Username is required."
  }),
  role_id: joi.number().required().messages({
    "number.empty": "Role ID is required.",
    "any.required": "Role ID is required."
  }),
  password: joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required."
  }),
  
});



const vehicleValidation = joi.object({
  vehicle_number: joi.string()
    .pattern(/^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/i) // Regex pattern for Indian vehicle number
    .required()
    .messages({
      "string.empty": "Vehicle number is required.",
      "any.required": "Vehicle number is required.",
      "string.pattern.base": "Vehicle number must be in the format 'XX 00 XX 0000' or 'XX 00 0000 XX'."
    }),
  entry_for: joi.string().valid('service', 'test drive', 'delivery', 'pickup').required().messages({
    "string.empty": "Entry for is required.",
    "any.required": "Entry for is required.",
    "any.only": "Entry for must be one of 'service', 'test drive', 'delivery', or 'pickup'."
  }),
});

const changePasswordValidation = joi.object({

  current_password: joi.string().required().messages({
    "any.only": "Confirm password must match the password.",
    "string.empty": "Confirm password cannot be empty.",
    "any.required": "Confirm password is required."
  }),
  new_password: joi.string()
  .min(8) // Minimum length of 8 characters
  .pattern(/[A-Z]/) // At least one uppercase letter
  .pattern(/[a-z]/) // At least one lowercase letter
  .pattern(/[0-9]/) // At least one number
  .pattern(/[@$!%*?&]/) // At least one special character
  .required()
  .messages({
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&).",
    "any.required": "Password is required."
  }),
  confirm_new_password: joi.string().valid(joi.ref('new_password')).required().messages({
    "any.only": "Confirm password must match the password.",
    "string.empty": "Confirm password cannot be empty.",
    "any.required": "Confirm password is required."
  })
});

const categoryValidation = joi.object({
  name: joi.string().required().messages({
    "string.empty": "Confirm password cannot be empty.",
    "any.required": "Confirm password is required."
  })
});


const productValidation = joi.object({
  name: joi.string().required(),
  category_id: joi.string().required(),
  stock: joi.number().required(),
  price: joi.number().required(),
  incoming: joi.number().optional(),
  outgoing: joi.number().optional(),
});

module.exports = {
  registerValidation,
  loginValidation,
  vehicleValidation,
  changePasswordValidation,
  categoryValidation,
  productValidation
};
