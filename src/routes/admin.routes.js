// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const vehicleRoutes = require('./vehicleRoutes');


// Mounting the routes
router.use('/auth', authRoutes);
router.use('/employees', userRoutes);
router.use('/vehicles', vehicleRoutes);



module.exports = router;
