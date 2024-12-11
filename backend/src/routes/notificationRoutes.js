const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Routes
router.get('/', authenticateToken, getAllNotifications);
router.get('/:id', authenticateToken, getNotificationById);
router.post('/', authenticateToken, createNotification);
router.put('/:id/read', authenticateToken, markNotificationAsRead);
router.put('/mark-all-read', authenticateToken, markAllNotificationsAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.delete('/', authenticateToken, deleteAllNotifications);

module.exports = router;