import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { API_BASE } from '../utils/api';

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('tathya_token');

      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const { data } = await axios.get(`${API_BASE}/notifications`, config);
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn('API returned non-array data for notifications:', data);
        setNotifications([]); // Ensure notifications is always an array
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If unauthorized, clear auth storage
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('tathya_user');
        localStorage.removeItem('tathya_token');
        localStorage.removeItem('tathya-is-authenticated');
        localStorage.removeItem('user-profile-data');
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('tathya_token');

      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map((notif) => (notif._id === id ? { ...notif, read: true } : notif)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('tathya_token');

      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      await axios.delete(`${API_BASE}/notifications/${id}`, config);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_upload':
        return <FaInfoCircle className="text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none">
        <FaBell className="text-xl" />
        {notifications.filter((notif) => !notif.read).length > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-10">
          <div className="py-2 px-4 bg-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <span className="text-sm text-gray-600">{notifications.filter((notif) => !notif.read).length} unread</span>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500">No new notifications</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <li key={notif._id} className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;