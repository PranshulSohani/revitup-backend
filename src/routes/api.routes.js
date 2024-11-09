const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const multer = require('multer');
const path = require('path');
const userController = require("../controllers/user_controller");
const vehicleController = require("../controllers/vehicle_controller");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  var upload = multer({
    storage: storage
  });

// user/auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/get-workers",[auth,role([5])], userController.getWorkers);
router.put("/change-password",auth, userController.changePassword);

// vehicle routes
router.post("/vehicle-entry",auth, vehicleController.entry); 
router.post("/make-vehicle-exit-request",auth, vehicleController.makeExitRequest); 
router.post("/approve-vehicle-exist-request/:requestId",auth, vehicleController.approveVehicleExisttRequest); 
router.get("/get-entered-vehicles",auth, vehicleController.getEnteredVehicles); 
router.post("/add-vehicle-in-service-bay",auth,upload.fields([
    { name: 'seat_pic', maxCount: 1 },
    { name: 'odometer_pic', maxCount: 1 },
    { name: 'focus_area_1_pic', maxCount: 1 },
    { name: 'focus_area_2_pic', maxCount: 1 },  
    { name: 'vehicle_rc_pic', maxCount: 1 },
    { name: 'vehicle_insurance_policy_pic', maxCount: 1 },  
  ]),vehicleController.addVehicleInServiceBay);
router.get("/get-bay-vehicles",[auth,role([5])], vehicleController.getBayVehicles); 
router.post("/assign-worker-in-bay",[auth,role([5])], vehicleController.assignWorkerInBay);

module.exports = router;