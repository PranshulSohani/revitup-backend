const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Token ko HTTP-only cookie se lete hain
  const token = req.cookies.token;

  // Agar token nahi hai, toh unauthorized response de
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided"
    });
  }

  // Token ko verify kare
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid token"
      });
    }

    // Token valid hai, decoded information ko request object mein store kare
    req.user = decoded; // Yeh user information ko aap aage use kar sakte hain
    next(); // Next middleware ko call kare
  });
};

module.exports = auth;
