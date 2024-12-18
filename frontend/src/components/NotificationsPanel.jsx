import React, { useEffect, useState } from 'react';
import { mainAxios } from '../context/AuthContext';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await mainAxios.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await mainAxios.put('/notifications/mark-all-read');
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await mainAxios.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await mainAxios.put(`/notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete a single notification
  const deleteNotification = async (id) => {
    try {
      await mainAxios.delete(`/notifications/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow">
      <div className="flex justify-between gap-4 mb-4">
        <button
          onClick={markAllAsRead}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Mark All as Read
        </button>
        <button
          onClick={deleteAllNotifications}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete All
        </button>
      </div>
      <h2 className="text-lg font-bold mb-4">Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`p-2 border-b ${notification.read ? 'bg-gray-200' : ''}`}
          >
            <p>{notification.message}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => markAsRead(notification._id)}
                className={`text-blue-500 ${notification.read ? 'line-through' : ''}`}
              >
                {notification.read ? 'Read' : 'Mark as Read'}
              </button>
              <button
                onClick={() => deleteNotification(notification._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPanel;
