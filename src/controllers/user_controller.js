const User = require("../../src/models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation, changePasswordValidation } = require('../../src/validators/validators');
const { sendResponse, handleError } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");

const userService = new CrudService(User);

// Register Function
exports.register = async (req, res) => {
  const { full_name, email, mobile_number, designation, role_id, password } = req.body;

  try {
    // Validate request data using Joi schema
    const { error } = registerValidation.validate(req.body);
    if (error) {
      sendResponse(res, 400, false, error.details[0].message);
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = {
      full_name,
      email,
      mobile_number,
      designation,
      role_id,
      password: hashPassword
    };

    // Save the user using CrudService
    const userResp = await userService.create(newUser);
    return sendResponse(res, 201, true, "Employee registered successfully.",userResp);
  } catch (error) {
    return handleError(error, res);
  }
};

// Login Function
exports.login = async (req, res) => {
  try {
    // Validate request body using Joi schema
    const { error } = loginValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    const { username, role_id, password } = req.body;

    // Determine whether username is an email or mobile number
    const mobileRegex = /^\+91[0-9]{10}$/;
    const query = mobileRegex.test(username) ? { mobile_number: username, role_id } : { email: username.toLowerCase(), role_id };

    // Find the user using CrudService
    const user = await userService.findOne(query);

    if (!user) {
      return sendResponse(res, 400, false, "Employee record not exist.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      returnsendResponse(res, 401, false, "Employee record not exist.");
    }

    const tokenData = {
      id: user._id,
      email: user.email,
      full_name: user.full_name
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1h" });
    // Store token in the database
    await userService.update({ _id: user._id }, { token });
    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true
    });

    return sendResponse(res, 200, true, "Login Successfully", { token });
  } catch (error) {
    return handleError(error, res);
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { new_password, current_password } = req.body;


    // Validate request body using Joi schema
    const { error } = changePasswordValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }
    const token =  req.header('Authorization').replace('Bearer ', '');
    const query =  { token: token};

    // Find the user using CrudService
    const user = await userService.findOne(query);
   
   
    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      return sendResponse(res, 401, false, "Incorrect current password1.");
    }

    const hashPassword = await bcrypt.hash(new_password, 10);

    // Update the vehicle entry using CrudService with requestId
    const response = await userService.update({ _id: user._id }, {
      password: hashPassword
    }); // Assuming _id is the field for request ID in MongoDB

    console.log("response",response)

     // Check if the update was successful
     if (response) {
      return sendResponse(res, 200, true, "Password changed successfully", { token });

     } else {
      return sendResponse(res, 404, false, "User not found or update failed.");

     }

  } catch (error) {
    return handleError(error, res);
  }
};