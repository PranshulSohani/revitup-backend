const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const userController = require("../controllers/user_controller");
const vehicleController = require("../controllers/vehicle_controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/vehicle/entry",auth, vehicleController.entry); // Use auth middleware for vehicle entry
router.post("/vehicle/make-exit-request",auth, vehicleController.makeExitRequest); // Use auth middleware for vehicle entry
router.post("/vehicle/approve-exist-request/:requestId",auth, vehicleController.approveVehicleExisttRequest); // Use auth middleware for vehicle entry
router.get("/vehicle/get-entered-vehicles",auth, vehicleController.getEnteredVehicles); // Use auth middleware for vehicle entry
router.put("/change-password",auth, userController.changePassword);

module.exports = router;
