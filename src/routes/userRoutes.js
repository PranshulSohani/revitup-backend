// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// User routes

// POST /products - Create a new product
router.post("/create",auth, userController.create);   

// Get list of users
router.get("/", [auth, role([2,9])], userController.getAll);

// GET /employees/:userId - Get user details by user ID
router.get("/:userId", auth, userController.get);

// PUT /employees/:userId - Update a specific user by ID
router.put("/:userId", [auth, role([9])], userController.update); 

// DELETE /employees/:userId - Delete a specific user by ID
router.delete("/:userId", [auth, role([9])], userController.delete);

// GET /users/attendance - Get employee attendance list
router.get("/attendance-list", [auth, role([9])], userController.getEmployeeAttendanceList);

// POST /users/assign-in-bay - Assign worker to a vehicle in the service bay
router.post("/assign-in-bay", [auth, role([2])], userController.assignInBay);

module.exports = router;
