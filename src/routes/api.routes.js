const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const multer = require('multer');
const path = require('path');

// Import the controllers
const userController = require("../controllers/user_controller");
const vehicleController = require("../controllers/vehicle_controller");
const categoryController = require("../controllers/category_controller");

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
router.get("/get-user-detail/:userId",[auth], userController.getUserDetail);
router.put("/change-password",auth, userController.changePassword);
router.get("/get-employee-attendance-list",[auth], userController.getEmployeeAttendanceList);

// vehicle routes
router.post("/vehicle-entry",[auth,role([6])], vehicleController.entry); 
router.post("/make-vehicle-exit-request",[auth,role([6])], vehicleController.makeExitRequest); 
router.post("/approve-vehicle-exist-request/:requestId",[auth,role([1])], vehicleController.approveVehicleExisttRequest); 
router.get("/get-entered-vehicles",[auth,role([6])], vehicleController.getEnteredVehicles); 
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


// Create a new category
router.post("/create-category", [auth, role([8])], categoryController.create);
// Get all categories with pagination
router.get("/get-all-categories", [auth, role([8])], categoryController.getAll);
// Get category by ID
router.get("/get-category-detail/:categoryId", [auth, role([8])], categoryController.get);
// Update category by ID
router.put("/update-category/:categoryId", [auth, role([8])], categoryController.update);
// Delete category by ID
router.delete("/delete-category/:categoryId", [auth, role([8])], categoryController.delete);

module.exports = router;