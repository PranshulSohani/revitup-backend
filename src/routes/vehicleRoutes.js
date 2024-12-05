// routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle_controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// RESTful routes for Vehicle resource

// POST /vehicles/entry - Register vehicle entry
router.post("/entry", [auth, role([6])], vehicleController.entry);

// POST /vehicles/exit-request - Create vehicle exit request
router.post("/exit-request", [auth, role([6])], vehicleController.makeExitRequest);

// POST /vehicles/approve-exit/:requestId - Approve vehicle exit request by request ID
router.post("/approve-exit-request/:requestId", [auth, role([1])], vehicleController.approveVehicleExisttRequest);

// GET /vehicles/entered - Get all entered vehicles
router.get("/entered", [auth, role([1,6])], vehicleController.getEnteredVehicles);


// GET /vehicles/waiting - Get all waiting vehicles
router.get("/waiting", [auth, role([7])], vehicleController.getWaitingVehicles);

// POST /vehicles/create-job-card - Creae job card to service bay with images
router.post("/create-job-card", [auth, role([7])], upload.fields([
  { name: 'seat_pic', maxCount: 1 },
  { name: 'odometer_pic', maxCount: 1 },
  { name: 'focus_area_1_pic', maxCount: 1 },
  { name: 'focus_area_2_pic', maxCount: 1 },
  { name: 'vehicle_rc_pic', maxCount: 1 },
  { name: 'vehicle_insurance_policy_pic', maxCount: 1 },
]), vehicleController.createJobCard);

// GET /vehicles/get-job-card/:jobCardId - Get job card details
router.get("/get-job-card/:jobCardId", [auth, role([7])], vehicleController.getJobCardDetail);

// GET /vehicles/create-job-card-quotation - create job card quotation of vehicle
router.post("/create-job-card-quotation", [auth, role([7])], vehicleController.createJobCardQuotation);

// GET /vehicles/get-job-card-quotations/:jobCardId - Get job card quotations
router.get("/get-job-card-quotation/:jobCardId", [auth, role([7])], vehicleController.getJobCardQuotation);


// GET /vehicles/create-job-card-quotation - create job card quotation of vehicle
router.delete("/delete-job-card-quotation/:quotationId", [auth, role([7])], vehicleController.deleteJobCardQuotation);

// GET /vehicles/bay - Get all vehicles in service bay
router.get("/bay", [auth, role([2])], vehicleController.getBayVehicles);


// POST /employees/assign-worker - Assign worker to a vehicle in the service bay
router.post("/assign-worker", [auth, role([2])], vehicleController.assignWorker);

// POST /employees/add-task - add task of worker in project
router.post("/add-task", [auth, role([3])], vehicleController.addTask);

// Get list of task
router.get("/get-task-list", [auth, role([3])], vehicleController.getAllTask);


// get workers working
router.get("/get-workers-working", [auth, role([3])], vehicleController.getWorkersWorking);


module.exports = router;
