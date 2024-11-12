const User = require("../../src/models/User");
const EmployeeAttendance = require("../../src/models/EmployeeAttendance");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation, changePasswordValidation } = require('../../src/validators/validators');
const { sendResponse, handleError , formatToIST,getNameInitials  } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const userService = new CrudService(User);
const attendanceService = new CrudService(EmployeeAttendance);
const moment = require('moment');

// Register Function
exports.register = async (req, res) => {
  const { full_name, email, mobile_number, designation, role_id, password } = req.body;

  try {
    // Validate request data using Joi validation
    const { error } = registerValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }


    // Check if mobile_number or email already exists for the role
    const existingUser = await userService.findOne({
      role_id,
      $or: [{ mobile_number }, { email }],
    });

    if (existingUser) {
      return sendResponse(res,400,false,"Email or mobile number already exists for this role.");
    }


    // Save the user using CrudService
    const userResp = await userService.create(req.body);

    // Check if user was created successfully
    if (!userResp || !userResp._id) {
      return sendResponse(res, 500, false, "Failed to register employee.");
    }
    
    // Successfully created the user
    return sendResponse(res, 201, true, "Employee registered successfully.", userResp);
  } catch (error) {
    console.log("Error:", error);
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
      return sendResponse(res, 401, false, "Employee record not exist.");
    }


      // add employee check in data

      var attendanceData = {
         'check_in_date_time' : new Date(),
         'employee_id'  : user._id
      }

      // Save the user using CrudService
      const attendanceResp = await attendanceService.create(attendanceData);

      // Check if user was created successfully
      if (!attendanceResp || !attendanceResp._id) {
        return sendResponse(res, 500, false, "Failed to creae aendance.");
      }
    

    const tokenData = {
      id: user._id,
      email: user.email,
      full_name: user.full_name
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1h" });
    // Store token in the database
    await userService.update({ _id: user._id }, { token });
    

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


exports.getWorkers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const myCustomLabels = {
    totalDocs: "totalDocs",
    docs: "data",
    limit: "limit",
    page: "page",
    nextPage: "nextPage",
    prevPage: "prevPage",
    totalPages: "totalPages",
    pagingCounter: "slNo",
    meta: "paginator",
  };

  const options = {
    page: page,
    limit: limit,
    customLabels: myCustomLabels,
  };
  try {
    var myAggregate = User.aggregate([
      {
        $match: {
          role_id: 3,
        },
      },
      {
        $sort: {
          createdAt: -1 // Sort by createdAt field in descending order (latest first)
        }
      },
    ]);
    await User.aggregatePaginate(myAggregate, options)
      .then((result) => {
        if (result) {      
          result.data = result.data.map(worker => {
              return {
                ...worker,
                name_initial: getNameInitials(worker.full_name,'full_name'),
              };
                        
             }); 

            res.status(200).send({
              status: true,
              message: "success",
              data: result,
            });
        } else {
          res.status(200).send({
            status: false,
            message: "No Workers found",
            data:[]
          });

        }
      })
      .catch((error) => {
        res.send({
          status: false,
          message: error.toString() ?? "Error",
        });
      });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.toString() ?? "Internal Server Error",
    });
  }
};

// User Detail Function
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = { _id : userId };

    // Find the user using CrudService
    const user = await userService.findOne(query);

    if (!user) {
      return sendResponse(res, 400, false, "User record not exist.");
    }

    user.name_initial = getNameInitials(user.full_name,'full_name');

    return sendResponse(res, 200, true, "User data found",  user);
  } catch (error) {
    return handleError(error, res);
  }
};




exports.getEmployeeAttendanceList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const date = req.query.date ? new Date(req.query.date) : null;
  const searchKey = req.query.search_key || '';

  const myCustomLabels = {
    totalDocs: "totalDocs",
    docs: "data",
    limit: "limit",
    page: "page",
    nextPage: "nextPage",
    prevPage: "prevPage",
    totalPages: "totalPages",
    pagingCounter: "slNo",
    meta: "paginator",
  };

  const options = {
    page: page,
    limit: limit,
    customLabels: myCustomLabels,
  };

  try {
    const matchConditions = {};
    if (date) {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();
      matchConditions.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }
    console.log("searchKey",searchKey)
     // Apply searchKey filter for employee name
   

    const myAggregate = EmployeeAttendance.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee_details",
        },
      },
      { $unwind: "$employee_details" },
      {
        // Only include specific fields without mixing exclusion
        $project: {
          initials: 1,
          check_in_date_time:1,
          _id:0,
          employee_details: 1, // Include the full employee_details record
        },
      },
      {
        $sort: { check_in_date_time: -1 },
      },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$check_in_date_time" } } },
          check_in_date_time: { $first: "$check_in_date_time" },
          check_out_date_time: { $first: "$check_out_date_time" },
          employee_details: { $first: "$employee_details" },
        },
      },
      {
        $project: {
          _id:0,
        },
      },
    ]);

    await EmployeeAttendance.aggregatePaginate(myAggregate, options)
      .then((result) => {
        if (result.data.length > 0) {
          // Filter the data based on searchKey after fetching the results
          if (searchKey && searchKey.length > 0) {
            result.data = result.data.filter((attendance) => {
              // Get the full_name of the employee (ensure it defaults to an empty string if not available)
              const fullName = attendance.employee_details.full_name || '';
              // Perform a case-insensitive "like" query using .includes()
              return fullName.toLowerCase().includes(searchKey.toLowerCase());
            });
          }

          result.data = result.data.map((attendance) => {
          //  console.log("result.data",result.data)
            return {
              ...attendance,
              name_initial: getNameInitials(attendance.employee_details.full_name,'first_name'),
              attendance_date: moment(attendance.check_in_date_time).format("DD MMM YYYY"),
              check_in_time: moment(attendance.check_in_date_time).format("hh:mm A"),
              check_out_time: attendance.check_out_date_time
                ? moment(attendance.check_out_date_time).format("HH:mm A")
                : null,
              status : 'Present',
            };
          });

          res.status(200).send({
            status: true,
            message: "Success",
            data: result,
          });
        } else {
          res.status(200).send({
            status: false,
            message: "No attendance records found",
            data: [],
          });
        }
      })
      .catch((error) => {
        res.send({
          status: false,
          message: error.toString() || "Error",
        });
      });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.toString() || "Internal Server Error",
    });
  }
};




