const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const userController = require("../controllers/user_controller");
const vehicleController = require("../controllers/vehicle_controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/vehicle/entry", vehicleController.entry); // Use auth middleware for vehicle entry
router.post("/vehicle/make-exit-request", vehicleController.makeExitRequest); // Use auth middleware for vehicle entry
router.post("/vehicle/approve-exist-request/:requestId", vehicleController.approveVehicleExisttRequest); // Use auth middleware for vehicle entry
router.get("/vehicle/get-entered-vehicles", vehicleController.getEnteredVehicles); // Use auth middleware for vehicle entry

module.exports = router;
