// Importing models
const User = require("../../src/models/User");
const EmployeeAttendance = require("../../src/models/EmployeeAttendance");

// Importing helper functions
const { sendResponse, handleError, getNameInitials } = require('../../src/helpers/helper');

// Importing 'moment' library for date and time manipulation

const moment = require('moment');

// Importing the CrudService to handle CRUD operations on models
const CrudService = require("../../src/services/CrudService");

// Creating service instances for each model to perform CRUD operations
const userService = new CrudService(User);

// Importing validation functions
const { createEmployeeValidation,updateEmployeeValidation } = require('../../src/validators/validators');

// create new user
exports.create = async (req, res) => {
  const { full_name, email, mobile_number, designation, role_id, password,department_id,employment_type,joining_date } = req.body;

  try {
    const { error } = createEmployeeValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    const existingUser = await userService.findOne({
      role_id,
      $or: [{ mobile_number }, { email }],
    });

    if (existingUser) return sendResponse(res, 400, false, "Email or mobile number already exists for this role.");

    const userResp = await userService.create(req.body);

    if (!userResp || !userResp._id) return sendResponse(res, 500, false, "Failed to create employee.");

    return sendResponse(res, 201, true, "Employee created successfully.", userResp);
  } catch (error) {
    return handleError(error, res);
  }
};


// Get all Users based on role if provided / 
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const roleId = req.query.role_id;
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

  const options = { page, limit, customLabels: myCustomLabels };

  try {
    var aggregateStages = [
      {
        $match: {
          role_id:  (req.user.role_id == 1) ?  { $nin: [1, 9] } : { $ne: 1  }, // Exclude role_id 1 and 9
          ...(roleId ? { role_id: Number(roleId) } : {}), // Ensure you have the ternary complete with : {}
          ...(searchKey ? { full_name: { $regex: searchKey, $options: 'i' } } : {}) // Case-insensitive match
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'departments', // name of the department collection
          localField: 'department_id', // field in department schema
          foreignField: '_id', // field in User schema
          as: 'department_details', // output field name for category details
        },
      },
      {
        $unwind: {
          path: '$department_details', // unwind the department_details array into an object
          preserveNullAndEmptyArrays: true // keeps the user document even if no department is found
        }
      }
    ];
   
    
    var myAggregate = User.aggregate(aggregateStages);
    

    await User.aggregatePaginate(myAggregate, options).then((result) => {
      if (result) {
        result.data = result.data.map(worker => ({
          ...worker,
          name_initial: getNameInitials(worker.full_name, 'full_name')
        }));
        res.status(200).send({ status: true, message: "success", data: result });
      } else {
        res.status(200).send({ status: false, message: "No data found", data: [] });
      }
    }).catch(error => res.send({ status: false, message: error.toString() || "Error" }));
  } catch (error) {
    res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
  }
};

// Get User Detail Function
exports.get = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findOne({ _id: userId });

    if (!user) return sendResponse(res, 400, false, "User record not exist.");

    user.name_initial = getNameInitials(user.full_name, 'full_name');
    console.log("Full Name:", user.full_name);

    const initials = getNameInitials(user.full_name, 'full_name');


    console.log("Name Initials:", initials);

    return sendResponse(res, 200, true, "Data found", {
      ...user.toObject(),  // if using Mongoose model, convert to plain object
      name_initial: user.name_initial
    });
  
  } catch (error) {
    return handleError(error, res);
  }
};


// Update a user by ID
exports.update = async (req, res) => {
  const { full_name, email, mobile_number, designation, role_id, password,department_id,employment_type,joining_date } = req.body;
  const { userId } = req.params;

  try {

    const { error } = updateEmployeeValidation.validate(req.body);
    console.log("error",error)
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    const existingUser = await userService.findOne({
      role_id,
      $or: [{ mobile_number }, { email }],
      _id: { $ne: userId }, // Exclude the current user ID
    });

    if (existingUser) return sendResponse(res, 400, false, "Email or mobile number already exists for this role.");



    const response = await userService.update({ _id: userId },req.body);
    if (response) {
      return sendResponse(res, 200, true, "Employee updated successfully", response);
    } else {
      return sendResponse(res, 404, false, "Employee not found or update failed.");
    }
  } catch (error) {
    console.log("error",error)
    return handleError(error, res);
  }
};

// Delete a user by ID
exports.delete = async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await userService.delete({ _id: userId });
    if (response) {
      return sendResponse(res, 200, true, "Employee deleted successfully");
    } else {
      return sendResponse(res, 404, false, "Employee not found or deletion failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};


// Get Employee Attendance List Function
exports.getEmployeeAttendanceList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const date = req.query.date ? new Date(req.query.date) : new Date(); // Default to today if date is not provided
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
  const options = { page, limit, customLabels: myCustomLabels };

  try {
    const matchConditions = {
      createdAt: {
        $gte: moment(date).startOf("day").toDate(),
        $lt: moment(date).endOf("day").toDate(),
      },
      "employee_details.role_id": { $nin: [9, 1] }, // Exclude role IDs 9 and 1
    };

    const myAggregate = EmployeeAttendance.aggregate([
      { 
        $lookup: {
          from: "users",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee_details",
        }
      },
      { $unwind: "$employee_details" },
      { $match: matchConditions },
      {
        $addFields: {
          attendance_date: { $dateToString: { format: "%Y-%m-%d", date: "$check_in_date_time" } },
        },
      },
      {
        $group: {
          _id: { employee_id: "$employee_id", date: "$attendance_date" },
          check_in_date_time: { $first: "$check_in_date_time" },
          check_out_date_time: { $first: "$check_out_date_time" },
          employee_details: { $first: "$employee_details" },
        },
      },
      {
        $project: {
          _id: 0,
          employee_id: "$_id.employee_id",
          date: "$_id.date",
          check_in_date_time: 1,
          check_out_date_time: 1,
          employee_details: 1,
        },
      },
      { $sort: { check_in_date_time: -1 } },
    ]);
    
    

    await EmployeeAttendance.aggregatePaginate(myAggregate, options).then(result => {
      if (result.data.length > 0) {
        if (searchKey) {
          result.data = result.data.filter(attendance => {
            const fullName = attendance.employee_details.full_name || '';
            return fullName.toLowerCase().includes(searchKey.toLowerCase());
          });
        }
        console.log("len",result.data.length)
        result.data = result.data.map(attendance => ({
          ...attendance,
          name_initial: getNameInitials(attendance.employee_details.full_name, 'first_name'),
          date: moment(attendance.date).format("DD MMM YYYY"),
          check_in_time: moment(attendance.check_in_date_time).format("hh:mm A"),
          check_out_time: attendance.check_out_date_time
            ? moment(attendance.check_out_date_time).format("HH:mm A")
            : null,
          status: 'Present',
        }));

        res.status(200).send({ status: true, message: "Data found", data: result });
      } else {
        res.status(200).send({ status: false, message: "No attendance records found", data: [] });
      }
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
  }
};



exports.getCounts = async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();
    const tomorrow = moment().endOf("day").toDate();

    // Match today's attendance records
    const matchConditions = {
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    // Fetch total employees from the Users collection
    const totalEmployees = await userService.findAll();

    // Calculate present employees from the EmployeeAttendance collection
    const attendanceAggregate = await EmployeeAttendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: "$employee_id", // Group by employee ID to avoid duplicates
        },
      },
    ]);

    const presentEmployees = attendanceAggregate.length;

    // Calculate absent employees
    const absentEmployees = totalEmployees.length - presentEmployees;

    var result = {
      total_employees : totalEmployees.length,
      present_employees : presentEmployees,
      absent_employees : absentEmployees,
    };

    return sendResponse(res, 200, true, "Stock counts retrieved successfully", result);

  } catch (error) {
    return handleError(error, res);
  }
};

