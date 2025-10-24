import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTrash, FaCheck } from 'react-icons/fa';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
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

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map((notif) => (notif._id === id ? { ...notif, read: true } : notif)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_upload':
        return <FaInfoCircle className="text-blue-500" />;
      case 'report_status':
        return <FaCheckCircle className="text-green-500" />;
      case 'new_message':
        return <FaBell className="text-purple-500" />;
      case 'system_alert':
        return <FaInfoCircle className="text-yellow-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'document_upload':
        return 'Document';
      case 'report_status':
        return 'Report';
      case 'new_message':
        return 'Message';
      case 'system_alert':
        return 'Alert';
      default:
        return 'Notification';
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'document_upload':
        return 'bg-blue-100 text-blue-800';
      case 'report_status':
        return 'bg-green-100 text-green-800';
      case 'new_message':
        return 'bg-purple-100 text-purple-800';
      case 'system_alert':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNotifications(!showNotifications)} 
        className="relative p-3 rounded-full bg-gray-100 hover:bg-blue-100 transition-all duration-300"
      >
        <FaBell className="text-xl text-gray-700" />
        {notifications.filter((notif) => !notif.read).length > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200"
          >
            <div className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <span className="text-sm text-blue-100">
                {notifications.filter((notif) => !notif.read).length} unread
              </span>
            </div>
            
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No new notifications</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <motion.li 
                      key={notif._id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notif.type)}`}>
                              {getNotificationTypeText(notif.type)}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-sm mt-2 ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notif.message}
                          </p>
                          <div className="mt-3 flex space-x-3">
                            {!notif.read && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleMarkAsRead(notif._id)}
                                className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <FaCheck className="mr-1" /> Read
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteNotification(notif._id)}
                              className="text-xs flex items-center text-red-600 hover:text-red-800 font-medium"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationComponent;