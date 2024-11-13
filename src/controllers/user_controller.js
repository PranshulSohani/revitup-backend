const User = require("../../src/models/User");
const BaysWorker = require("../../src/models/BaysWorker");
const EmployeeAttendance = require("../../src/models/EmployeeAttendance");
const { sendResponse, handleError, getNameInitials } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const moment = require('moment');
const userService = new CrudService(User);
const attendanceService = new CrudService(EmployeeAttendance);
const bayService = new CrudService(BaysWorker);

// Get Workers Function
exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const roleId = req.query.role_id;
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
    console.log("roleId",roleId)

    var myAggregate = User.aggregate([
      { $match: { role_id: Number(roleId) } },
      { $sort: { createdAt: -1 } }
    ]);

    await User.aggregatePaginate(myAggregate, options).then((result) => {
      console.log("result",result)
      if (result) {
        result.data = result.data.map(worker => ({
          ...worker,
          name_initial: getNameInitials(worker.full_name, 'full_name')
        }));
        res.status(200).send({ status: true, message: "success", data: result });
      } else {
        res.status(200).send({ status: false, message: "No Workers found", data: [] });
      }
    }).catch(error => res.send({ status: false, message: error.toString() || "Error" }));
  } catch (error) {
    res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
  }
};

// Get User Detail Function
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findOne({ _id: userId });

    if (!user) return sendResponse(res, 400, false, "User record not exist.");

    user.name_initial = getNameInitials(user.full_name, 'full_name');
    console.log("Full Name:", user.full_name);

    const initials = getNameInitials(user.full_name, 'full_name');


    console.log("Name Initials:", initials);

    return sendResponse(res, 200, true, "User data found", {
      ...user.toObject(),  // if using Mongoose model, convert to plain object
      name_initial: user.name_initial
    });
  
  } catch (error) {
    return handleError(error, res);
  }
};

// Get Employee Attendance List Function
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
  const options = { page, limit, customLabels: myCustomLabels };

  try {
    const matchConditions = date
      ? {
          createdAt: {
            $gte: moment(date).startOf("day").toDate(),
            $lt: moment(date).endOf("day").toDate()
          }
        }
      : {};

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
        $project: {
          initials: 1,
          check_in_date_time: 1,
          check_out_date_time: 1,
          employee_details: 1,
        },
      },
      { $sort: { check_in_date_time: -1 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$check_in_date_time" } },
          check_in_date_time: { $first: "$check_in_date_time" },
          check_out_date_time: { $first: "$check_out_date_time" },
          employee_details: { $first: "$employee_details" },
        },
      },
      {
        $project: {
          _id: 0, // Remove _id from the final output
          date: "$_id", // Rename _id to date
          check_in_date_time: 1,
          check_out_date_time: 1,
          employee_details: 1,
        },
      },
    ]);

    await EmployeeAttendance.aggregatePaginate(myAggregate, options).then(result => {
      if (result.data.length > 0) {
        if (searchKey) {
          result.data = result.data.filter(attendance => {
            const fullName = attendance.employee_details.full_name || '';
            return fullName.toLowerCase().includes(searchKey.toLowerCase());
          });
        }
        console.log("result.data",result.data);

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

        res.status(200).send({ status: true, message: "Success", data: result });
      } else {
        res.status(200).send({ status: false, message: "No attendance records found", data: [] });
      }
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
  }
};


exports.assignInBay = async (req, res) => {
  try {
    const { worker_id, bay_id } = req.body;

    console.log("body",req.body);

    var checkExitenceofWorkerInBay = await bayService.findOne({ worker_id, bay_id });
    if(checkExitenceofWorkerInBay){
      return sendResponse(res, 200, false, "Worker already assgined");
    } else {
      const response = await bayService.create(req.body);

   
    console.log("response",response)
     if (response) {
      return sendResponse(res, 200, true, "Worker assgined successfully",response);

     } else {
      return sendResponse(res, 404, false, "User not found or update failed.");

     }
    }
    

  } catch (error) {
    return handleError(error, res);
  }
};