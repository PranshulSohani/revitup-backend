// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');

const departmentController = require('../controllers/department_controller');


// Mounting the routes
router.use('/auth', authRoutes);
router.use('/employees', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);


// GET /department - Get all departments
router.get("/departments", departmentController.getAll);

module.exports = router;
