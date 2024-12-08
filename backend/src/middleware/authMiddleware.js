const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized" });
    }
  }

  // If no token
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin role check middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

module.exports = { authenticateToken, isAdmin };
