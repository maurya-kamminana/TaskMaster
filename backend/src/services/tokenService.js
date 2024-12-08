const jwt = require("jsonwebtoken");

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "15d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
