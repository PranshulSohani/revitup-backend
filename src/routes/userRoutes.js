// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User routes

// GET /users/ - Get list of users (role 5)
router.get("/", auth, userController.getUsers);

// GET /users/attendance - Get employee attendance list
router.get("/attendance-list", auth, userController.getEmployeeAttendanceList);

// GET /users/:userId - Get user details by user ID
router.get("/:userId", auth, userController.getUserDetail);



// POST /users/assign-in-bay - Assign worker to a vehicle in the service bay
router.post("/assign-in-bay", [auth, role([5])], userController.assignInBay);

module.exports = router;
