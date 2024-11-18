const User = require("../../src/models/User");
const EmployeeAttendance = require("../../src/models/EmployeeAttendance");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation, changePasswordValidation } = require('../../src/validators/validators');
const { sendResponse, handleError } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const userService = new CrudService(User);
const attendanceService = new CrudService(EmployeeAttendance);


// Register Function
exports.register = async (req, res) => {
  const { full_name, email, mobile_number, designation, role_id, password,department_id } = req.body;

  try {
    const { error } = registerValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);
    
    const existingUser = await userService.findOne({
      role_id,
      $or: [{ mobile_number }, { email }],
    });

    if (existingUser) return sendResponse(res, 400, false, "Email or mobile number already exists for this role.");

    const userResp = await userService.create(req.body);

    if (!userResp || !userResp._id) return sendResponse(res, 500, false, "Failed to register employee.");

    return sendResponse(res, 201, true, "Employee registered successfully.", userResp);
  } catch (error) {
    return handleError(error, res);
  }
};

// Login Function
exports.login = async (req, res) => {
  try {

    const { username, role_id, password } = req.body;
    const mobileRegex = /^\+91[0-9]{10}$/;
    const query = mobileRegex.test(username) ? { mobile_number: username, role_id } : { email: username.toLowerCase(), role_id };

    const user = await userService.findOne(query);
    if (!user) return sendResponse(res, 400, false, "Invalid username.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return sendResponse(res, 401, false, "Invalid password.");
    
    // Track user as available upon successful login
    const updateData = { availablity_status: 'available' }; // Update status to available
    await userService.update({ _id: user._id }, updateData);
    
    


    
    // add employee check in data

      var attendanceData = {
        'check_in_date_time' : new Date(),
        'employee_id'  : user._id
     }

     // Save the user using CrudService
     const attendanceResp = await attendanceService.create(attendanceData);

     // Check if user was created successfully
     if (!attendanceResp || !attendanceResp._id) {
       return sendResponse(res, 500, false, "Failed to create attendance.");
     }

    const tokenData = { id: user._id, email: user.email, full_name: user.full_name };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET);
    const isTokenActive  = true;

    await userService.update({ _id: user._id }, { token,isTokenActive });

    return sendResponse(res, 200, true, "Login Successfully", { token });
  } catch (error) {
    return handleError(error, res);
  }
};

// Change Password Function
exports.changePassword = async (req, res) => {
  try {
    const { new_password, current_password } = req.body;

    const { error } = changePasswordValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    const token = req.header('Authorization').replace('Bearer ', '');
    const user = await userService.findOne({ token });

    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) return sendResponse(res, 401, false, "Incorrect current password.");

    const hashPassword = await bcrypt.hash(new_password, 10);

    const response = await userService.update({ _id: user._id }, { password: hashPassword });

    if (response) return sendResponse(res, 200, true, "Password changed successfully", { token });
    else return sendResponse(res, 404, false, "User not found or update failed.");
  } catch (error) {
    return handleError(error, res);
  }
};


// Logout Function
exports.logout = async (req, res) => {
  try {
    // Get user ID from the token (assuming the token is passed via the Authorization header)
    const token = req.header('Authorization').replace('Bearer ', ''); // Extract the token from the Authorization header
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Verify the token
    
    const attendance = await attendanceService.findOne({
      employee_id: decoded.id,
      $or: [
        { check_out_date_time: { $exists: false } },
        { check_out_date_time: null }
      ]
    });  


    if (!attendance) {
      return sendResponse(res, 400, false, "No attendance record found.");
    }


    // Update the attendance record with the check-out time
    const attendanceData = {
      check_out_date_time: new Date(), // Mark the check-out time
    };

    // Save the updated attendance record using CrudService
    const updatedAttendance = await attendanceService.update({ _id: attendance._id }, attendanceData);

    // Check if attendance was successfully updated
    if (!updatedAttendance) {
      return sendResponse(res, 500, false, "Failed to update attendance.");
    }


    // Find the user by decoded id
    const user = await userService.findOne({ _id: decoded.id });
    if (!user) return sendResponse(res, 400, false, "User not found.");

    // Update the user to remove the token and mark them as unavailable
    const updateData = { token: null, availablity_status: 'unavailable','isTokenActive' : false  }; 
    await userService.update({ _id: user._id }, updateData);

    return sendResponse(res, 200, true, "Logged out successfully.");
  } catch (error) {
    return handleError(error, res);
  }
};
