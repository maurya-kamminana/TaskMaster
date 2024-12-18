const jwt = require("jsonwebtoken");
const { sequelize, User } = require('../models/postgres_models');

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
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET,  (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Access token expired" });
        }
        return decoded;
      }
      );

      // Get user from the token
      req.user = await User.findOne({
        where: { id: decoded.id },
        attributes: { exclude: ['password_hash'] }
      });

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

module.exports = { authenticateToken };
