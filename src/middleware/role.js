const { sendResponse } = require('../../src/helpers/helper');


const role = (allowedRoles) => {
    return (req, res, next) => {
      const userRoleId = req.user?.role_id; // Assuming req.user.roleId holds the user's role ID
      
      // Check if the user's role ID is in the list of allowed roles
      if (allowedRoles.includes(userRoleId)) {
        return next(); // Allow access
      } else {
        return sendResponse(res, 403, false, "Access denied. You do not have the necessary permissions.");
      }
    };
  };
  


module.exports = role;

