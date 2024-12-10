const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/:id', authenticateToken, userController.getUserById);

module.exports = router;