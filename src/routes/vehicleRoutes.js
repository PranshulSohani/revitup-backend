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
router.get("/entered", [auth, role([6])], vehicleController.getEnteredVehicles);

// POST /vehicles/service-bay - Add vehicle to service bay with images
router.post("/service-bay", auth, upload.fields([
  { name: 'seat_pic', maxCount: 1 },
  { name: 'odometer_pic', maxCount: 1 },
  { name: 'focus_area_1_pic', maxCount: 1 },
  { name: 'focus_area_2_pic', maxCount: 1 },
  { name: 'vehicle_rc_pic', maxCount: 1 },
  { name: 'vehicle_insurance_policy_pic', maxCount: 1 },
]), vehicleController.addVehicleInServiceBay);

// GET /vehicles/bay - Get all vehicles in service bay
router.get("/bay", [auth, role([2])], vehicleController.getBayVehicles);



module.exports = router;
