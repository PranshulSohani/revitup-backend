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
  const { full_name, email, mobile_number, designation, role_id, password } = req.body;

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
    const { error } = loginValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    const { username, role_id, password } = req.body;
    const mobileRegex = /^\+91[0-9]{10}$/;
    const query = mobileRegex.test(username) ? { mobile_number: username, role_id } : { email: username.toLowerCase(), role_id };

    const user = await userService.findOne(query);
    if (!user) return sendResponse(res, 400, false, "Employee record not exist.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return sendResponse(res, 401, false, "Employee record not exist.");
      // add employee check in data

      var attendanceData = {
        'check_in_date_time' : new Date(),
        'employee_id'  : user._id
     }

     // Save the user using CrudService
     const attendanceResp = await attendanceService.create(attendanceData);

     // Check if user was created successfully
     if (!attendanceResp || !attendanceResp._id) {
       return sendResponse(res, 500, false, "Failed to creae attendance.");
     }

    const tokenData = { id: user._id, email: user.email, full_name: user.full_name };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1h" });

    await userService.update({ _id: user._id }, { token });

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
