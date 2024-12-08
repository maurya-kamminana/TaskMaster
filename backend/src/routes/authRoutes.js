const express = require('express');
const { registerUser, loginUser, generateNewToken, removeRefreshToken } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refreshToken', generateNewToken);
router.delete('/logout', removeRefreshToken);

module.exports = router;