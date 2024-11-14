// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const auth = require('../middleware/auth');

// Authentication routes

// POST /auth/register - Register a new user
router.post("/register", authController.register);

// POST /auth/login - Login a user
router.post("/login", authController.login);

// PUT /auth/change-password - Change password for an authenticated user
router.put("/change-password", auth, authController.changePassword);

// POST /auth/logout - logout a user
router.post("/logout",auth, authController.logout);

module.exports = router;
