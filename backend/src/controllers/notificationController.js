const { Notification } = require("../models");

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user_id !== req.user.id) {
      return res.status(404).json({
        error: "Notification not found or notification belongs to other user",
      });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /notifications
exports.createNotification = async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ error: "Type and message are required" });
    }

    // validate type
    const validTypes = ["project_user_added", "project_user_removed"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const notification = await Notification.create({
      user_id: req.user.id,
      type,
      message,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user_id !== req.user.id) {
      return res
        .status(404)
        .json({
          error: "Notification not found or notification belongs to other user",
        });
    }
    notification.read_status = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /notifications/mark-all-read
exports.markAllNotificationsAsRead = async (req, res) => {
  const session = await Notification.startSession();
  session.startTransaction();
  try {
    await Notification.updateMany(
      { user_id: req.user.id, read_status: false },
      { $set: { read_status: true } },
      { session }
    );
    await session.commitTransaction();
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// DELETE /notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user_id !== req.user.id) {
      return res
        .status(404)
        .json({
          error: "Notification not found or notification belongs to other user",
        });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /notifications
exports.deleteAllNotifications = async (req, res) => {
const session = await Notification.startSession();
session.startTransaction();
try {
    await Notification.deleteMany({ user_id: req.user.id }, { session });
    await session.commitTransaction();
    res.status(200).json({ message: "All notifications deleted successfully" });
} catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
} finally {
    session.endSession();
}
};
