const joi = require('joi').extend(require("@joi/date"));
const User = require("../../src/models/User");
// Define roles array
const roles = [
  { role_id: 1, role_name: 'Admin' },
  { role_id: 2, role_name: 'Bay Manager' },
  { role_id: 3, role_name: 'Project Manager' },
  { role_id: 4, role_name: 'Worker' },
  { role_id: 5, role_name: 'CEO' },
  { role_id: 6, role_name: 'Security Guard' },
  { role_id: 7, role_name: 'Service Manager' },
  { role_id: 8, role_name: 'Inventory Manager' },
  { role_id: 9, role_name: 'HR Manager' }
];

// Extract valid role_ids
const validRoleIds = roles
    .filter(role => role.role_id !== 1) // Exclude role_id 1
    .map(role => role.role_id); // Extract remaining role_ids


// Exclude "Admin" role by filtering out its role_id
const validRoleNames = roles
    .filter(role => role.role_id !== 1) // Exclude roles with role_id = 1
    .map(role => role.role_name); // Extract role_name
    

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
  }),
  designation: joi.string().valid(...validRoleNames).required().messages({
    "string.empty": "Designation is required.",
    "any.required": "Designation is required.",
    "any.only": "Designation must be one of the following:Bay Manager, Project Manager, Worker, CEO, Security Guard, Service Manager, Inventory Manager, HR Manager."

  }),
  role_id: joi.number()
  .valid(...validRoleIds) // Allowed values for role_id
  .required()
  .messages({
    "number.base": "Role ID must be a number.",
    "any.required": "Role ID is required.",
    "any.only": "Role ID must be one of the following:2,3,4,5,6,7,8,9."
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
  }),
  department_id: joi.string().required().messages({
    "string.empty": "Department id is required.",
    "any.required": "Department id is required."
  }),
});

// Function to dynamically generate the schema
const loginValidation = (url) => {
  // Common base schema
  const schema = {
    username: joi.string().required().messages({
      "string.empty": "Username is required.",
      "any.required": "Username is required."
    }),
    password: joi.string().min(8).required().messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "any.required": "Password is required."
    }),
  };

  // Conditional role_id validation based on URL
  if (url.includes('/api')) {
    schema.role_id = joi.number()
      .valid(2, 3, 4, 5, 6, 7, 8, 9) // Excludes 1
      .required()
      .messages({
        "number.empty": "Role ID is required.",
        "any.required": "Role ID is required.",
        "any.only": "Role ID must be one of the following: 2, 3, 4, 5, 6, 7, 8, 9."
      });
  } else if (url.includes('/admin')) {
    schema.role_id = joi.number()
      .valid(1) // Only allows 1
      .required()
      .messages({
        "number.empty": "Role ID is required.",
        "any.required": "Role ID is required.",
        "any.only": "Role ID must be 1."
      });
  }

  return joi.object(schema);
};




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

const baseEmployeeValidation = joi.object({
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
  }),
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
  }),
  department_id: joi.string().required().messages({
    "string.empty": "Department id is required.",
    "any.required": "Department id is required."
  }),
  employment_type: joi.string()
  .valid("Full time", "Part time")  // Specify allowed string values
  .optional()
  .messages({
    "any.only": "Employment type must be either 'Full time' or 'Part time'.",
    "string.base": "Employment type must be a text value."
  }),
  joining_date: joi.date()
  .format("YYYY-MM-DD")
  .optional()
  .messages({
    "date.base": "joining date must be a valid date.",
    "date.format": "joining date must be in YYYY-MM-DD format."
  })
  .custom( (value, helpers) => {
    if (value !== '') {
      const d = new Date(value);
      const todayDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      const joiningDate = d.toISOString().split('T')[0]; // Convert joining date to YYYY-MM-DD format

      // Log for debugging
      console.log("todayDate:", todayDate);
      console.log("joiningDate:", joiningDate);

      if (joiningDate > todayDate) {
        console.log("joining date is in the future.");
        return helpers.message("joining date should not be a future date.");
      }
    }
    return value; // Return value if valid
  })

});

// Create schema (requires all fields)
const createEmployeeValidation = baseEmployeeValidation;

// Update schema (some fields optional)
const updateEmployeeValidation = baseEmployeeValidation.fork(
  [
    "password",
    "confirm_password"
  ],
  (schema) => schema.optional()
);



module.exports = {
  registerValidation,
  loginValidation,
  vehicleValidation,
  changePasswordValidation,
  categoryValidation,
  productValidation,
  createEmployeeValidation,
  updateEmployeeValidation,
};
