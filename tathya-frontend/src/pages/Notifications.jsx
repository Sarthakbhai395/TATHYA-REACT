import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft, FaTrash, FaCheck } from 'react-icons/fa';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';
import ProtectedRoute from '../components/ProtectedRoute';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      if (Array.isArray(data)) {
        // Sort notifications by date (newest first)
        const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sortedNotifications);
      } else {
        console.warn('API returned non-array data for notifications:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map((notif) => (notif._id === id ? { ...notif, read: true } : notif)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // We'll show a subtle error in the UI instead of an alert
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      // We'll show a subtle error in the UI instead of an alert
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(notif => !notif.read);
      await Promise.all(unreadNotifications.map(notif => markAsRead(notif._id)));
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_upload':
        return <FaInfoCircle className="text-blue-500 text-xl" />;
      case 'report_status':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'new_message':
        return <FaBell className="text-purple-500 text-xl" />;
      case 'system_alert':
        return <FaInfoCircle className="text-yellow-500 text-xl" />;
      default:
        return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'document_upload':
        return 'Document Upload';
      case 'report_status':
        return 'Report Status';
      case 'new_message':
        return 'New Message';
      case 'system_alert':
        return 'System Alert';
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

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-700 text-lg font-medium">Loading your notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">
            <FaTimesCircle />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Notifications</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNotifications}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with glassmorphism effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden mb-8 border border-white border-opacity-30"
        >
          <div className="py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/user-dashboard')}
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FaArrowLeft className="text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <FaBell className="mr-3 text-blue-500" />
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1">
                  {notifications.filter((notif) => !notif.read).length} unread notifications
                </p>
              </div>
            </div>
            {notifications.some(notif => !notif.read) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Mark all as read
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-6">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white border-opacity-30"
            >
              <div className="text-gray-400 text-6xl mb-6">
                <FaBell />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No notifications yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You're all caught up! Check back later for new notifications.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/user-dashboard')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white border-opacity-30 ${
                    !notif.read ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notif.type)}`}>
                              {getNotificationTypeText(notif.type)}
                            </span>
                            {!notif.read && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={`mt-3 text-gray-800 ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.message}
                        </p>
                        <div className="mt-4 flex space-x-3">
                          {!notif.read && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMarkAsRead(notif._id)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <FaCheck className="mr-1" /> Mark as read
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteNotification(notif._id)}
                            className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

// Export with ProtectedRoute wrapper
const Notifications = () => (
  <ProtectedRoute>
    <NotificationsPage />
  </ProtectedRoute>
);

export default Notifications;