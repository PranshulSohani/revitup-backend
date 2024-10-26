const VehicleLog = require("../../src/models/VehicleLog");
const VehicleExitRequest = require("../../src/models/VehicleExitRequest");
const { vehicleValidation } = require('../../src/validators/validators');
const { sendResponse, handleError } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");

const vehicleLogService = new CrudService(VehicleLog);
const vehicleExitRequestService = new CrudService(VehicleExitRequest);



// Register Function for Vehicle Entry
exports.entry = async (req, res) => {
  const { vehicle_number, entry_for } = req.body;

  try {
    // Validate request data using Joi schema
    const { error } = vehicleValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message); // Return early on validation error
    }

    const newVehicleEntry = {
      vehicle_number,
      entry_for,
    };

    // Save the vehicle entry using CrudService
    const resp = await vehicleLogService.create(newVehicleEntry);
    return sendResponse(res, 201, true, "Vehicle's entry has been done successfully.", resp); // Return the response
  } catch (error) {
    return handleError(error, res); // Return the error handling response
  }
};


// Approve vehicle request by request ID
exports.makeExitRequest = async (req, res) => {
  const { vehicle_log_id } = req.body; // Assuming requestId is passed in the URL parameters

  try {
  
    const vehicleExitRequest = {
      vehicle_log_id,
    };

    const resp = await vehicleExitRequestService.create(vehicleExitRequest);

    return sendResponse(res, 200, true, "Vehicle exit request has been done successfully.", resp); // Return the response
  } catch (error) {
    console.log("error",error)
    return handleError(error, res); // Return the error handling response
  }
};

// Get list of entered vehicles
exports.getEnteredVehicles = async (req, res) => {
  try {
    // Retrieve the list of vehicles using CrudService
    const vehicles = await vehicleLogService.findAll(); 
    return sendResponse(res, 200, true, "List of entered vehicles retrieved successfully.", vehicles); // Return the response
  } catch (error) {
    return handleError(error, res); // Return the error handling response
  }
};


exports.approveVehicleExisttRequest = async (req, res) => {
  const { requestId } = req.params; // Assuming requestId is passed in the URL parameters

  try {
  
    const vehicleEntryUpdate = {
      status: 'Approved',
    };


    // Update the vehicle entry using CrudService with requestId
    const response = await vehicleExitRequestService.update({ _id: requestId }, vehicleEntryUpdate); // Assuming _id is the field for request ID in MongoDB



     // Check if the update was successful
     if (response) {
      const VehicleLogUpdate = {
        exit_time: Date.now(),
      };

      await vehicleLogService.update({ _id: response.vehicle_log_id }, VehicleLogUpdate); // Assuming _id is the field for request ID in MongoDB

      return sendResponse(res, 200, true, "Request approved successfully.", response);

    } else {
      return sendResponse(res, 404, false, "Vehicle exit request not found or update failed.");

    }





  } catch (error) {
    return handleError(error, res);
  }
};



