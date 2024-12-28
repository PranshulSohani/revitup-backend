// Importing models
const VehicleLog = require("../../src/models/VehicleLog");
const VehicleExitRequest = require("../../src/models/VehicleExitRequest");
const vehicleMaintenceLog = require("../../src/models/VehicleMaintenceLog");
const jobCardQuotation = require("../../src/models/JobCardQuotation");
const Product = require("../../src/models/Product");
const BaysWorker = require("../../src/models/BaysWorker");
const WorkersTask = require("../../src/models/WorkersTask");
const User = require("../../src/models/User");


// Importing validation functions
const { vehicleValidation } = require('../../src/validators/validators');

// Importing helper functions
const { sendResponse, handleError } = require('../../src/helpers/helper');

// Importing the CrudService to handle CRUD operations on models
const CrudService = require("../../src/services/CrudService"); 

// Creating service instances for each model to perform CRUD operations
const vehicleLogService = new CrudService(VehicleLog); 
const vehicleExitRequestService = new CrudService(VehicleExitRequest); 
const vehicleMaintenceLogService = new CrudService(vehicleMaintenceLog); 
const jobCardQuotationService = new CrudService(jobCardQuotation); 
const productService = new CrudService(Product); 
const bayWorkerService = new CrudService(BaysWorker);
const workersTaskService = new CrudService(WorkersTask);
const userService = new CrudService(User);

// Importing the PaginationService to handle pagination logic for querying data
const paginationService = require("../../src/services/PaginationService"); 

 // moment.js or JavaScript's native Date methods.
const moment = require('moment'); 


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


exports.getBayVehicles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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
    var myAggregate = vehicleMaintenceLog.aggregate([
      { 
        $match: {
          ...(searchKey ? { vehicle_number: { $regex: searchKey, $options: 'i' } } : {}) // Case-insensitive match
        }
      },
      {
        $sort: {
          createdAt: -1 // Sort by createdAt field in descending order (latest first)
        }
      }
    ]);
    await vehicleMaintenceLog.aggregatePaginate(myAggregate, options)
      .then(async(result) => {
        if (result) {
            const baseURL = `${req.protocol}://${req.get('host')}`;

            result.data = await Promise.all(
              result.data.map(async (vehicleMlog) => {
                  console.log("vehicleMlog", vehicleMlog);
                  var jobCardId = vehicleMlog._id;
                  var checkExistenceOfWorkerInBay = await bayWorkerService.find({ 'job_card_id' : jobCardId });
                  console.log("checkExistenceOfWorkerInBay",checkExistenceOfWorkerInBay)
                  var status = (checkExistenceOfWorkerInBay.length > 0) ? "Working" : "Parking";
                  vehicleMlog.status = status;

                  const result1 = await jobCardQuotation.aggregate([
                   
                    {
                        $lookup: {
                            from: "products", // Name of the product collection
                            localField: "product_id", // Field in jobCardQuotationService that references product
                            foreignField: "_id", // Field in the product collection that matches product_id
                            as: "product_details" // Output array field name for the joined product data
                        }
                    },
                    { 
                      $match: {
                         job_card_id:  jobCardId
                      }
                    },
                    {
                        $unwind: { 
                            path: "$product_details", // Unwind the product_details array to include a single object
                            preserveNullAndEmptyArrays: true // Optional: keep job cards even if no product is found
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1 // Sort the results by creation date, descending
                        }
                    }
                ]);
                vehicleMlog.request_parts = result1;
                
                console.log('result1',result1);
                

                  return {
                      ...vehicleMlog,
                  };
              })
          );


              // Update image URLs for each event in the data array
            /*  result.data = result.data.map((async) vehicleMlog => {
              console.log("vehicleMlog",vehicleMlog);
              var jobCardId =   vehicleMlog._id;
              var checkExitenceofWorkerInBay = await bayWorkerService.findOne({ jobCardId });



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
                          
               });  */       

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


// Get list of waiting vehicles
exports.getWaitingVehicles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchBy =  'vehicle_number';
  const searchKey = req.query.search_key || '';
  const sort = { createdAt: -1 }; // Sort by "createdAt" in descending order

  try {
   

    // Always include `status: 'waiting'` in the search criteria
    let searchCriteria = { status: 'waiting' };

    // If `searchBy` and `searchKey` are provided, add them to `searchCriteria`
    if (searchBy && searchKey) {
        searchCriteria[searchBy] = searchKey;
    }
    const result = await paginationService.paginate(VehicleLog,[], page, limit, searchCriteria, sort);

    if (result) {
      return sendResponse(res, 200, true, "Data found", result);
    } else {
      return sendResponse(res, 200, false, "No products found", []);
    }
  } catch (error) {
    return handleError(error, res);
  }
};

// create Job Card
exports.createJobCard = async (req, res) => {
  const {
    customer_name, address, pin_code, email, visit_type, vehicle_type, make_and_model, contact_number,
    dob, booking_number, gst_number, vehicle_reg_no, vin_no, engine_no, model_no, sold_by, sold_date,
    odo, color_name, work_type, ro_date, ro_number, printing_time, special_message,
    ac_filter,brakes,air_filter,engine_oil,service_type,cusomer_request,additional_description
  } = req.body;

  console.log("body", req.body);

  try {
    var vehicleNumber = req.body.vehicle_number;
    const existingJobCard = await vehicleMaintenceLogService.findOne({'vehicle_number': vehicleNumber});

    if (existingJobCard) return sendResponse(res, 400, false, "Job card already exists.");



    // Access uploaded files from req.files
    const seat_pic = req.files['seat_pic'] ? req.files['seat_pic'][0].filename : undefined;
    const odometer_pic = req.files['odometer_pic'] ? req.files['odometer_pic'][0].filename : undefined;
    const focus_area_1_pic = req.files['focus_area_1_pic'] ? req.files['focus_area_1_pic'][0].filename : undefined;
    const focus_area_2_pic = req.files['focus_area_2_pic'] ? req.files['focus_area_2_pic'][0].filename : undefined;
    const vehicle_rc_pic = req.files['vehicle_rc_pic'] ? req.files['vehicle_rc_pic'][0].filename : undefined;
    const vehicle_insurance_policy_pic = req.files['vehicle_insurance_policy_pic'] ? req.files['vehicle_insurance_policy_pic'][0].filename : undefined;
    const vehicle_rear_pic = req.files['vehicle_rear_pic'] ? req.files['vehicle_rear_pic'][0].filename : undefined;
    const vehicle_right_pic = req.files['vehicle_right_pic'] ? req.files['vehicle_right_pic'][0].filename : undefined;
    const vehicle_left_pic = req.files['vehicle_left_pic'] ? req.files['vehicle_left_pic'][0].filename : undefined;
    const vehicle_front_pic = req.files['vehicle_front_pic'] ? req.files['vehicle_front_pic'][0].filename : undefined;


    // Check if vehicle_number is an array, and convert it to a single string
    let vehicleData = { vehicle_number: [req.body.vehicle_number, ""] };
    if (Array.isArray(vehicleData.vehicle_number)) {
      req.body.vehicle_number = vehicleData.vehicle_number.filter(Boolean).join(", ");
      var vehicle_number = req.body.vehicle_number;
    }

    let expected_delivery_time = "17:00";
      // Convert the ro_date string to a Date object
      let roDateObj = new Date(ro_date);

      // Add 2 days to the roDateObj
      roDateObj.setDate(roDateObj.getDate() + 2);

      // Format the expected delivery date as YYYY-MM-DD
      let expected_delivery_date = roDateObj.toISOString().split('T')[0]; // Format the date to 'YYYY-MM-DD'


    const reqData = {
      vehicle_number,
      customer_name,
      address,
      pin_code,
      email,
      visit_type,
      vehicle_type,
      make_and_model,
      contact_number,
      dob,
      booking_number,
      gst_number,
      vehicle_reg_no,
      vin_no,
      engine_no,
      model_no,
      sold_by,
      sold_date,
      odo,
      color_name,
      work_type,
      ro_date,
      ro_number,
      printing_time,
      special_message,
      seat_pic,
      odometer_pic,
      focus_area_1_pic,
      focus_area_2_pic,
      vehicle_rc_pic,
      vehicle_insurance_policy_pic,
      vehicle_rear_pic,
      vehicle_right_pic,
      vehicle_left_pic,
      vehicle_front_pic,
      expected_delivery_date,
      expected_delivery_time
    };

    var response = await vehicleMaintenceLogService.create(reqData);

    if (!response || !response._id) {
      return sendResponse(res, 500, false, "Failed.");
    } 

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
    const vehicleRearUrl = vehicle_rear_pic ? `${baseURL}/uploads/${vehicle_rear_pic}` : null;
    const vehicleRightUrl = vehicle_right_pic ? `${baseURL}/uploads/${vehicle_right_pic}` : null;
    const vehicleLeftUrl = vehicle_left_pic ? `${baseURL}/uploads/${vehicle_left_pic}` : null;
    const vehicleFrontUrl = vehicle_front_pic ? `${baseURL}/uploads/${vehicle_front_pic}` : null;

    // Attach image URLs to the response data
    var data = {
      ...response.toObject(),
      seat_pic: imageUrl,
      odometer_pic: odometerUrl,
      focus_area_1_pic: focusArea1Url,
      focus_area_2_pic: focusArea2Url,
      vehicle_rc_pic: vehicleRCUrl,
      vehicle_insurance_policy_pic: vehicleInsurancePolicyPicUrl,
      vehicle_rear_pic: vehicleRearUrl,
      vehicle_right_pic: vehicleRightUrl,
      vehicle_left_pic: vehicleLeftUrl,
      vehicle_front_pic: vehicleFrontUrl
    };

    


    return sendResponse(res, 200, true, "Job card created successfully.", data);
  } catch (error) {
    return handleError(error, res);
  }
};

// Get a Job Card Detail by ID
exports.getJobCardDetail = async (req, res) => {
  const { jobCardId } = req.params;
  try {
    const jobCard = await vehicleMaintenceLogService.findOne({ _id: jobCardId });
    if (!jobCard) return sendResponse(res, 400, false, "Job card does not exist.");

    return sendResponse(res, 200, true, "Data found", jobCard);
  } catch (error) {
    return handleError(error, res);
  }
};

// create Job Card Quotation

exports.createJobCardQuotation = async (req, res) => {
  const {job_card_id,product_id,quotaion_for,quantity,price,total_price} = req.body;
  try {
    const product = await productService.findOne({ _id: product_id });
    
    if (!product) {
      return sendResponse(res, 400, false, "Product not found.");
    }

    const jobCard = await vehicleMaintenceLogService.findOne({ _id: job_card_id });
    if (!jobCard) {
      return sendResponse(res, 400, false, "jobCard not found.");
    }


    // Check if the price in the quotation matches the product's actual price
    if (product.price !== req.body.price) {
      return sendResponse(res, 400, false, "Price should match the actual product price.");
    }

    // Check if the quantity in the quotation exceeds the available stock
    if (req.body.quantity > product.stock) {
      return sendResponse(res, 400, false, "Quantity exceeds available stock.");
    }

    var response = await jobCardQuotationService.create(req.body);
    if (!response || !response._id) {
      return sendResponse(res, 500, false, "Failed.");
    } 
    return sendResponse(res, 200, true, "Quotation created successfully.", response);
  } catch (error) {
    return handleError(error, res);
  }
};

// get a job card quotation
exports.getJobCardQuotation = async (req, res) => {
  const { jobCardId } = req.params;
  try {
    const response = await jobCardQuotationService.find({ job_card_id: jobCardId });
    if (response) {
      return sendResponse(res, 200, true, "Data found successfully",response);
    } else {
      return sendResponse(res, 404, false, "Quotation not found.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};


// Delete a job card quotation by ID
exports.deleteJobCardQuotation = async (req, res) => {
  const { quotationId } = req.params;
  try {
    const response = await jobCardQuotationService.delete({ _id: quotationId });
    if (response) {
      return sendResponse(res, 200, true, "Quotation deleted successfully");
    } else {
      return sendResponse(res, 404, false, "Quotation not found or deletion failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};


exports.assignWorker = async (req, res) => {
  try {
    const { worker_id, job_card_id } = req.body;

    var checkExitenceofWorkerInBay = await bayWorkerService.findOne({ worker_id, job_card_id });
    if(checkExitenceofWorkerInBay){
      return sendResponse(res, 200, false, "Worker already assgined");
    } else {
      const response = await bayWorkerService.create(req.body);

     if (response) {
      return sendResponse(res, 200, true, "Worker assigned successfully",response);

     } else {
        return sendResponse(res, 404, false, "User not found or failed.");
      }
    }
    

  } catch (error) {
    return handleError(error, res);
  }
};

// add task of worker in project
exports.addTask = async (req, res) => {
  try {
    const { project_manager_id, project_name,job_card_id,task_description } = req.body;
     
    const bayWorkerResponse = await bayWorkerService.find({'job_card_id' : job_card_id});   

    if (bayWorkerResponse.length > 0) {
      const response = await workersTaskService.create(req.body);
      if (response) {
      return sendResponse(res, 200, true, "Task added successfully",response);

      } else {
      return sendResponse(res, 404, false, "Failed.");

      }
    } else {
      return sendResponse(res, 200, false, "No workers added in job card");

    }  
  } catch (error) {
    return handleError(error, res);
  }
};

// Get all task 
exports.getAllTask = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchKey = req.query.seach_key || '';

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
    const myAggregate = WorkersTask.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'vehiclemaintencelogs',
          localField: 'job_card_id',
          foreignField: '_id',
          as: 'job_card_details',
        },
      },
      {
        $unwind: {
          path: '$job_card_details',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const result = await WorkersTask.aggregatePaginate(myAggregate, options);

    if (result) {
      // Fetch bay worker counts for each task
      const dataWithCounts = await Promise.all(
        result.data.map(async (task) => {
          const bayWorkers = await bayWorkerService.find({'job_card_id' : task.job_card_id});  
          var bayWorkerCount = bayWorkers.length;

          // Map through each bay worker to get their details
          const workers = await Promise.all(
            bayWorkers.map(async (bayWorker) => {
              console.log("bayWorker",bayWorker)
              const workerDetails = await userService.findOne({ '_id': bayWorker.worker_id }); 
              return workerDetails;
            })
          );

          // Flatten the array of workers to avoid nested arrays
          const flatWorkers = workers.flat();
          return {
            ...task,
            workers: flatWorkers,
            team_members : bayWorkerCount,
          };
        })
      );

      // Update result with the modified data
      result.data = dataWithCounts;

      res.status(200).send({
        status: true,
        message: "success",
        data: result,
      });
    } else {
      res.status(200).send({ status: false, message: "No data found", data: [] });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.toString() || "Internal Server Error" });
  }
};


exports.getWorkersWorking = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchKey = req.query.search_key || '';

  const myCustomLabels = {
    totalDocs: 'totalDocs',
    docs: 'data',
    limit: 'limit',
    page: 'page',
    nextPage: 'nextPage',
    prevPage: 'prevPage',
    totalPages: 'totalPages',
    pagingCounter: 'slNo',
    meta: 'paginator',
  };

  const options = {
    page: page,
    limit: limit,
    customLabels: myCustomLabels,
  };

  try {
    var myAggregate = BaysWorker.aggregate([
      {
        $match: {
          ...(searchKey ? { vehicle_number: { $regex: searchKey, $options: 'i' } } : {}), // Case-insensitive match
        },
      },
      {
        $lookup: {
          from: 'vehiclemaintencelogs', // Collection to join
          localField: 'job_card_id', // Field from the input documents
          foreignField: '_id', // Field from the "from" collection
          as: 'job_card_details', // Output array field
        },
      },
      {
        $lookup: {
          from: 'users', // Collection to join
          localField: 'worker_id', // Field from the input documents
          foreignField: '_id', // Field from the "from" collection
          as: 'worker_details', // Output array field
        },
      },
      {
        $sort: {
          createdAt: -1, // Sort by createdAt field in descending order (latest first)
        },
      },
    ]);

    await BaysWorker.aggregatePaginate(myAggregate, options)
      .then(async (result) => {
        if (result) {
          for (const worker of result.data) {
            for (const jobCard of worker.job_card_details) {
              // Fetch request parts for the specific job card
              const request_parts = await jobCardQuotation.aggregate([
                {
                  $match: {
                    job_card_id: jobCard._id, // Match by job card ID
                  },
                },
                {
                  $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product_details',
                  },
                },
                {
                  $unwind: {
                    path: '$product_details',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
              ]);

              // Add request_parts to the specific job card
              jobCard.request_parts = request_parts;
            }
          }

          res.status(200).send({
            status: true,
            message: 'success',
            data: result,
          });
        } else {
          res.status(200).send({
            status: false,
            message: 'No Events found',
            data: null,
          });
        }
      })
      .catch((error) => {
        res.send({
          status: false,
          message: error.toString() ?? 'Error',
        });
      });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.toString() ?? 'Internal Server Error',
    });
  }
};



