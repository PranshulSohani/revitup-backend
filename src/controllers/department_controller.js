// Importing models
const Department = require("../../src/models/Department");

// Importing helper functions
const { sendResponse, handleError } = require('../../src/helpers/helper');

// Importing the CrudService to handle CRUD operations on models
const CrudService = require("../../src/services/CrudService");

// Creating service instances for each model to perform CRUD operations
const departmentService = new CrudService(Department);

// Get All Departments Function
exports.getAll = async (req, res) => {
    try {
      const departments = await departmentService.findAll(); // Sort alphabetically by department name
      if (departments.length > 0) {
        return sendResponse(res, 200, true, "Data found",departments);
      } else {
        return sendResponse(res, 200, true, "No Data found", departments);
      }
    } catch (error) {
      return handleError(error, res);
    }
  };