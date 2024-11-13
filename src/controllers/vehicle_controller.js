const VehicleLog = require("../../src/models/VehicleLog");
const VehicleExitRequest = require("../../src/models/VehicleExitRequest");
const { vehicleValidation } = require('../../src/validators/validators');
const { sendResponse, handleError } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const vehicleLogService = new CrudService(VehicleLog);
const vehicleExitRequestService = new CrudService(VehicleExitRequest);
const vehicleMaintenceLog = require("../../src/models/VehicleMaintenceLog");


// Register Function for Vehicle Entry
exports.entry = async (req, res) => {
  const { vehicle_number, entry_for } = req.body;
  console.log("body",req.body)
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
    if(vehicles.length > 0){
      return sendResponse(res, 200, true, "List of entered vehicles retrieved successfully.", vehicles); // Return the response
    } else {
      return sendResponse(res, 200, false, "No data found.", vehicles); // Return the response
    }
   
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


exports.addVehicleInServiceBay = async (req, res) => {
  const { customer_name, address, vehicle_type, make_and_model, contact_number, dob } = req.body;
  console.log("body", req.body);

  try {
    // Access uploaded files from req.files
    const seat_pic = req.files['seat_pic'] ? req.files['seat_pic'][0].filename : undefined;
    const odometer_pic = req.files['odometer_pic'] ? req.files['odometer_pic'][0].filename : undefined;
    const focus_area_1_pic = req.files['focus_area_1_pic'] ? req.files['focus_area_1_pic'][0].filename : undefined;
    const focus_area_2_pic = req.files['focus_area_2_pic'] ? req.files['focus_area_2_pic'][0].filename : undefined;
    const vehicle_rc_pic = req.files['vehicle_rc_pic'] ? req.files['vehicle_rc_pic'][0].filename : undefined;
    const vehicle_insurance_policy_pic = req.files['vehicle_insurance_policy_pic'] ? req.files['vehicle_insurance_policy_pic'][0].filename : undefined;

    console.log("seat_pic", seat_pic);
    console.log("odometer_pic", odometer_pic);
    console.log("focus_area_1_pic", focus_area_1_pic);
    console.log("focus_area_2_pic", focus_area_2_pic);

    // Check if vehicle_number is an array, and convert it to a single string
    let vehicleData = { vehicle_number: [req.body.vehicle_number, ""] };
    if (Array.isArray(vehicleData.vehicle_number)) {
      req.body.vehicle_number = vehicleData.vehicle_number.filter(Boolean).join(", ");
      var vehicle_number = req.body.vehicle_number;
    }

    const reqData = {
      vehicle_number,
      customer_name,
      address,
      vehicle_type,
      make_and_model,
      contact_number,
      dob,
      seat_pic,       // Include the filenames in reqData
      odometer_pic,
      focus_area_1_pic,
      focus_area_2_pic,
      vehicle_rc_pic,
      vehicle_insurance_policy_pic      
    };

    var response = await vehicleMaintenceLog.create(reqData);

    // Get the base URL
    const protocol = req.protocol;
    const host = req.get('host');
    const baseURL = `${protocol}://${host}`;

    // Construct image URLs
    const imageUrl = seat_pic ? `${baseURL}/uploads/${seat_pic}` : null;
    const odometerUrl = odometer_pic ? `${baseURL}/uploads/${odometer_pic}` : null;
    const focusArea1Url = focus_area_1_pic ? `${baseURL}/uploads/${focus_area_1_pic}` : null;
    const focusArea2Url = focus_area_2_pic ? `${baseURL}/uploads/${focus_area_2_pic}` : null;
    const vehicleRCUrl = vehicle_rc_pic ? `${baseURL}/uploads/${vehicle_rc_pic}` : null;
    const vehicleInsurancePolicyPicUrl = vehicle_insurance_policy_pic ? `${baseURL}/uploads/${vehicle_insurance_policy_pic}` : null;

    // Attach image URLs to the response data
    var data = {
      ...response.toObject(),
        seat_pic: imageUrl,
        odometer_pic: odometerUrl,
        focus_area_1_pic: focusArea1Url,
        focus_area_2_pic: focusArea2Url,
        vehicle_rc_pic: vehicleRCUrl,
        vehicle_insurance_policy_pic: vehicleInsurancePolicyPicUrl
    };

    console.log("imageUrls", data.images);

    return sendResponse(res, 200, true, "Vehicle added in bay successfully.", data);
  } catch (error) {
    return handleError(error, res);
  }
};

exports.getBayVehicles = async (req, res) => {
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
    var myAggregate = vehicleMaintenceLog.aggregate([
      
      {
        $sort: {
          createdAt: -1 // Sort by createdAt field in descending order (latest first)
        }
      }
    ]);
    await vehicleMaintenceLog.aggregatePaginate(myAggregate, options)
      .then((result) => {
        if (result) {
            const baseURL = `${req.protocol}://${req.get('host')}`;

              // Update image URLs for each event in the data array
              result.data = result.data.map(vehicleMlog => {
              const seatImageUrl = baseURL + '/uploads/' + vehicleMlog.seat_pic;
              const odometerUrl = baseURL + '/uploads/' + vehicleMlog.odometer_pic;
              const focusArea1Url = baseURL + '/uploads/' + vehicleMlog.focus_area_1_pic;
              const focusArea2Url = baseURL + '/uploads/' + vehicleMlog.focus_area_2_pic;
              const vehicleRCUrl = baseURL + '/uploads/' + vehicleMlog.vehicle_insurance_policy_pic;
              const vehicleInsurancePolicyPicUrl = baseURL + '/uploads/' + vehicleMlog.vehicle_insurance_policy_pic;

                return {
                  ...vehicleMlog,
                  seat_pic: seatImageUrl,
                  odometer_pic: odometerUrl,
                  focus_area_1_pic: focusArea1Url,
                  focus_area_2_pic: focusArea2Url,
                  vehicle_rc_pic: vehicleRCUrl,
                  vehicle_insurance_policy_pic: vehicleInsurancePolicyPicUrl,
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
            message: "No Events found",
            data:null
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


