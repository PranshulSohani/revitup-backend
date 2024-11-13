const { sendResponse } = require('../../src/helpers/helper');
const CrudService = require("../../src/services/CrudService");
const jwt = require('jsonwebtoken');
const User = require("../../src/models/User");
const mongoose = require('mongoose');

const userService = new CrudService(User);

const auth = async (req, res, next) => {
  const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : '';
  
  if (!token) {
    return sendResponse(res, 401, false, "No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.id);  // Convert decoded.id to ObjectId
    console.log("userId",userId);
    // Verify that the token matches the one stored in the database
    const user = await userService.findOne({
      _id:  userId,
      token
    });
  
    console.log("token",token);

    if (!user) {
      return sendResponse(res, 401, false, "Unauthorized: Invalid token");
    }

    // Attach user info to request
    req.user = user;
    console.log("yha",user)
    next();
    console.log("yha 1")
  } catch (error) {
    console.log("error",error);
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error";

    return sendResponse(res, 500, false, errorMessage);
  }
};


module.exports = auth;

