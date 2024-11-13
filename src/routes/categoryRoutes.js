// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category_controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// RESTful routes for Category resource

// POST /categories - Create a new category
router.post("/", [auth, role([8])], categoryController.create);

// GET /categories - Get all categories
router.get("/", [auth, role([8])], categoryController.getAll);

// GET /categories/:categoryId - Get a specific category by ID
router.get("/:categoryId", [auth, role([8])], categoryController.get);

// PUT /categories/:categoryId - Update a specific category by ID
router.put("/:categoryId", [auth, role([8])], categoryController.update);

// DELETE /categories/:categoryId - Delete a specific category by ID
router.delete("/:categoryId", [auth, role([8])], categoryController.delete);

module.exports = router;
