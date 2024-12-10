const express = require('express');
const { getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', authenticateToken, getTaskById);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

module.exports = router;