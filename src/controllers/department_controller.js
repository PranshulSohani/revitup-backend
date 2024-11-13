const Department = require("../../src/models/Department");
const BaysWorker = require("../../src/models/BaysWorker");
const { sendResponse, handleError } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const moment = require('moment');
const departmentService = new CrudService(Department);

// Get All Departments Function
exports.getAll = async (req, res) => {
    try {
      const departments = await departmentService.findAll(); // Sort alphabetically by department name
      if (departments.length > 0) {
        return sendResponse(res, 200, true, "Data found",departments);
      } else {
        res.status(200).send({ status: false, message: "No departments found", data: [] });
      }
    } catch (error) {
      res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
    }
  };