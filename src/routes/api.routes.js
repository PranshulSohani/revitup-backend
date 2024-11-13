// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');

// Mounting the routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

module.exports = router;
