const { sequelize, User } = require('../models/postgres_models');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const redisClient = require("../../redisClient");
const { encrypt } = require("../services/cryptoService");
const { generateAccessToken, generateRefreshToken } = require("../services/tokenService");
const { Op } = require('sequelize');


// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
      [Op.or]: [{ email }, { username }]
      }
    })
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ username, email, password_hash });

    // Generate token
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    // store the refresh token in the redis database
    // Encrypt and store refresh token in Redis
    // const encryptedToken = encrypt(refresh_token);
    await redisClient.sAdd('RefreshTokens', refresh_token);

    console.log("successfully created user : " , user);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      access_token,
      refresh_token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials, user not registered" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials, incorrect password" });
    }

    // Generate token
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    // store the refresh token in the redis database
    // Encrypt and store refresh token in Redis
    // const encryptedToken = encrypt(refresh_token);
    await redisClient.sAdd('RefreshTokens', refresh_token);


    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      access_token,
      refresh_token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Genarate new access token using refresh token 
exports.generateNewToken = async (req, res) => {
  try {
    const refresh_token = req.body.refresh_token; // get refresh token from the request body

    // if refresh token is not provided return error
    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    
    // if refresh token is not present in the redis database return error
    // const encryptedToken = encrypt(refresh_token);
    const exists = await redisClient.sIsMember('RefreshTokens', refresh_token);
    if (!exists) {
        return res.status(401).json({ message: "Invalid refresh token, not in redis" });
    }

    // verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      const access_token = generateAccessToken(decoded); // generate new access token
      res.json({ access_token : access_token }); // return the new access token 
    });
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove refresh token from the redis database
exports.removeRefreshToken = async (req, res) => {
  try {
    const refresh_token = req.body.refresh_token; // get refresh token from the request body

    // if refresh token is not provided return error
    if (!refresh_token) return res.status(400).json({ message: "Refresh token is required" });

    // remove the refresh token from the redis database
    // Encrypt and remove refresh token from Redis
    // const encryptedToken = encrypt(refresh_token);
    const removed = await redisClient.sRem('RefreshTokens', refresh_token);

    if (removed > 0) {
        res.status(200).json({ message: "Refresh token removed successfully" });
    } else {
        res.status(404).json({ message: "Refresh token not found in Redis" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
