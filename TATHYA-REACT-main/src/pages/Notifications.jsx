// src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMarkAllAsReadConfirm, setShowMarkAllAsReadConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10; // Show 10 notifications per page

  // --- Simulate fetching notifications from an API ---
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock notification data - In a real app, this would come from your backend
      const mockNotifications = [
        {
          id: 1,
          title: 'New Message from Moderator',
          message: 'You have received a new confidential message from Priya Sharma regarding your report on academic pressure.',
          type: 'message',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          read: false,
          sender: 'Priya Sharma',
          avatar: 'https://images.pexels.com/photos/9991917/pexels-photo-9991917.jpeg',
          category: 'Moderator',
          actionRequired: true,
          link: '/moderator-chat?id=priya',
        },
        {
          id: 2,
          title: 'Report Status Update',
          message: 'Your report titled "Dealing with Overwhelming Exam Pressure" has been reviewed and is now in progress.',
          type: 'status',
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          sender: 'TATHYA System',
          avatar: 'https://cdn-icons-png.flaticon.com/512/4315/4315445.png',
          category: 'Reports',
          actionRequired: false,
          link: '/user-dashboard?section=reports',
        },
        {
          id: 3,
          title: 'Document Verification Completed',
          message: 'Your ID Proof document has been successfully verified. You now have access to premium features.',
          type: 'verification',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true,
          sender: 'Verification Team',
          avatar: 'https://images.unsplash.com/photo-1592085550638-e6bc180a731e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Documents',
          actionRequired: false,
          link: '/user-dashboard?section=documents',
        },
        {
          id: 4,
          title: 'Community Post Liked',
          message: 'Your post "Dealing with Overwhelming Exam Pressure" has received 24 likes from the community.',
          type: 'like',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          read: true,
          sender: 'Community Bot',
          avatar: 'https://images.pexels.com/photos/6256107/pexels-photo-6256107.jpeg',
          category: 'Community',
          actionRequired: false,
          link: '/community-feed/post/1',
        },
        {
          id: 5,
          title: 'New Comment on Your Post',
          message: 'Protected Identity commented on your post "Facing Continuous Harassment in Classroom".',
          type: 'comment',
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          read: false,
          sender: 'Protected Identity',
          avatar: 'https://images.unsplash.com/photo-1516440410312-3f7ec1d7f6f3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Community',
          actionRequired: true,
          link: '/community-feed/post/2',
        },
        {
          id: 6,
          title: 'Profile Updated Successfully',
          message: 'Your profile information has been updated. Changes are now reflected across the platform.',
          type: 'profile',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          read: true,
          sender: 'Profile Manager',
          avatar: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg',
          category: 'Profile',
          actionRequired: false,
          link: '/user-dashboard?section=profile',
        },
        {
          id: 7,
          title: 'Urgent: Action Required on Report',
          message: 'Your report "Excessive Assignment Load" requires your immediate attention. Please review the feedback.',
          type: 'urgent',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
          read: false,
          sender: 'Admin Team',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Reports',
          actionRequired: true,
          link: '/user-dashboard?section=reports',
        },
        {
          id: 8,
          title: 'New Resume Template Available',
          message: 'A new professional resume template "Executive Style" is now available for download.',
          type: 'template',
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
          read: true,
          sender: 'Resume Builder',
          avatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Career',
          actionRequired: false,
          link: '/resume-templates',
        },
        {
          id: 9,
          title: 'Security Alert: New Login Detected',
          message: 'A new login was detected on your account from a different device/IP. If this wasn\'t you, please secure your account immediately.',
          type: 'security',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
          read: false,
          sender: 'Security Team',
          avatar: 'https://images.unsplash.com/photo-1592085550638-e6bc180a731e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Security',
          actionRequired: true,
          link: '/security-alerts',
        },
        {
          id: 10,
          title: 'Weekly Community Digest',
          message: 'Check out this week\'s top community posts, trending topics, and featured moderators.',
          type: 'digest',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
          read: true,
          sender: 'Community Digest',
          avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Community',
          actionRequired: false,
          link: '/community-digest',
        },
        {
          id: 11,
          title: 'Reminder: Profile Verification Due Soon',
          message: 'Your profile verification expires in 30 days. Please renew your verification to maintain access to premium features.',
          type: 'reminder',
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
          read: false,
          sender: 'Verification Team',
          avatar: 'https://images.unsplash.com/photo-1592085550638-e6bc180a731e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Profile',
          actionRequired: true,
          link: '/profile-verification',
        },
        {
          id: 12,
          title: 'New Feature: AI-Powered Resume Builder',
          message: 'We\'ve launched our new AI-powered resume builder! Create professional resumes in minutes with personalized suggestions.',
          type: 'feature',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
          read: true,
          sender: 'Product Team',
          avatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          category: 'Features',
          actionRequired: false,
          link: '/new-feature-announcement',
        },
      ];

      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Fetch notifications on component mount ---
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Filter and sort notifications ---
  const filteredAndSortedNotifications = notifications
    .filter(notification => {
      if (activeFilter === 'unread') return !notification.read;
      if (activeFilter === 'read') return notification.read;
      if (activeFilter === 'action-required') return notification.actionRequired;
      return true; // 'all'
    })
    .filter(notification =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.sender.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'oldest') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  // --- Pagination ---
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredAndSortedNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(filteredAndSortedNotifications.length / notificationsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Handle marking a single notification as read ---
  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // --- Handle marking all notifications as read ---
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
    setShowMarkAllAsReadConfirm(false);
  };

  // --- Handle deleting a notification ---
  const deleteNotification = (id) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
    if (showNotificationDetail && selectedNotification?.id === id) {
      setShowNotificationDetail(false);
      setSelectedNotification(null);
    }
  };

  // --- Handle viewing notification details ---
  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetail(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // --- Handle going back from notification detail view ---
  const goBackToList = () => {
    setShowNotificationDetail(false);
    setSelectedNotification(null);
  };

  // --- Get priority color ---
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Get type icon ---
  const getTypeIcon = (type) => {
    switch (type) {
      case 'message': return 'fa-envelope';
      case 'status': return 'fa-info-circle';
      case 'verification': return 'fa-id-card';
      case 'like': return 'fa-heart';
      case 'comment': return 'fa-comment';
      case 'profile': return 'fa-user';
      case 'urgent': return 'fa-exclamation-triangle';
      case 'template': return 'fa-file-alt';
      case 'security': return 'fa-shield-alt';
      case 'digest': return 'fa-newspaper';
      case 'reminder': return 'fa-bell';
      case 'feature': return 'fa-star';
      default: return 'fa-bell';
    }
  };

  // --- Format timestamp ---
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffMs = now - notificationDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            Your Notifications
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Stay updated with important messages, report statuses, and community activity
          </motion.p>
        </motion.header>

        {/* Main Notification Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Notification Controls */}
          <motion.div
            className="notification-controls mb-8 flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter Buttons */}
              <div className="filter-buttons flex flex-wrap gap-2">
                {['all', 'unread', 'read', 'action-required'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      activeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="sort-dropdown relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-full py-2 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">By Priority</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-sort"></i>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>

            {/* Mark All as Read Button */}
            <div className="mark-all-read">
              <button
                onClick={() => setShowMarkAllAsReadConfirm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors duration-300 flex items-center"
              >
                <i className="fas fa-check-double mr-2"></i> Mark All as Read
              </button>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loader">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p>{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Notification Detail View */}
          <AnimatePresence>
            {showNotificationDetail && selectedNotification && (
              <motion.div
                className="notification-detail-view fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="notification-detail-header bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedNotification.title}</h2>
                        <p className="text-blue-200 text-sm">
                          From: {selectedNotification.sender} • {formatTimestamp(selectedNotification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={goBackToList}
                        className="text-white hover:text-gray-200 text-xl"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div className="notification-detail-content p-6">
                    <div className="flex items-center mb-6">
                      <img
                        src={selectedNotification.avatar}
                        alt={selectedNotification.sender}
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200"
                      />
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedNotification.priority)}`}>
                          {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)} Priority
                        </span>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {selectedNotification.category}
                        </span>
                      </div>
                    </div>
                    <div className="notification-message mb-6 text-gray-700 line-height-1-6">
                      <p dangerouslySetInnerHTML={{ __html: selectedNotification.message.replace(/\n/g, '<br>') }}></p>
                    </div>
                    <div className="notification-actions flex justify-end space-x-3">
                      {selectedNotification.actionRequired && (
                        <Link
                          to={selectedNotification.link}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                        >
                          Take Action
                        </Link>
                      )}
                      <button
                        onClick={() => deleteNotification(selectedNotification.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mark All as Read Confirmation Modal */}
          <AnimatePresence>
            {showMarkAllAsReadConfirm && (
              <motion.div
                className="mark-all-confirm-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Mark All as Read</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to mark all notifications as read? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowMarkAllAsReadConfirm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={markAllAsRead}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                    >
                      Mark All Read
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification List */}
          {!isLoading && !error && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="notification-list"
            >
              {currentNotifications.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-inbox text-5xl text-gray-400 mb-4"></i>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Notifications Found</h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? `No notifications match your search for "${searchQuery}".`
                      : activeFilter === 'unread'
                      ? 'You have no unread notifications. Great job staying updated!'
                      : 'There are currently no notifications in this category.'}
                  </p>
                </motion.div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {currentNotifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        variants={itemVariants}
                        className={`notification-item bg-white border rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                          notification.read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`notification-icon w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                            notification.read ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <i className={`fas ${getTypeIcon(notification.type)} text-lg`}></i>
                          </div>
                          <div className="notification-content flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4
                                  className={`notification-title text-sm font-bold mb-1 cursor-pointer ${
                                    notification.read ? 'text-gray-800' : 'text-blue-700'
                                  }`}
                                  onClick={() => viewNotificationDetails(notification)}
                                >
                                  {notification.title}
                                </h4>
                                <p
                                  className={`notification-message text-xs text-gray-600 mb-2 line-clamp-2 cursor-pointer ${
                                    !notification.read ? 'font-medium' : ''
                                  }`}
                                  onClick={() => viewNotificationDetails(notification)}
                                >
                                  {notification.message}
                                </p>
                              </div>
                              <div className="notification-meta flex flex-col items-end text-xs text-gray-500">
                                <span className="mb-1">{formatTimestamp(notification.timestamp)}</span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="notification-footer flex justify-between items-center mt-2">
                              <div className="notification-sender flex items-center text-xs text-gray-500">
                                <img
                                  src={notification.avatar}
                                  alt={notification.sender}
                                  className="w-6 h-6 rounded-full object-cover mr-2 border border-gray-200"
                                />
                                <span>{notification.sender}</span>
                              </div>
                              <div className="notification-actions flex space-x-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                    aria-label="Mark as read"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  aria-label="Delete notification"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      className="pagination flex justify-center mt-8 space-x-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Notification Overview Section */}
        <motion.section
          className="notification-overview py-16 mt-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-gray-800 mb-4"
              variants={itemVariants}
            >
              Notification Overview
            </motion.h2>
            <motion.div
              className="w-20 h-1 bg-blue-600 mx-auto"
              variants={itemVariants}
            ></motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                number: unreadCount, 
                label: 'Unread Messages', 
                icon: 'fa-envelope',
                color: 'blue'
              },
              { 
                number: notifications.filter(n => n.priority === 'high').length, 
                label: 'High Priority', 
                icon: 'fa-exclamation-circle',
                color: 'red'
              },
              { 
                number: notifications.filter(n => n.actionRequired).length, 
                label: 'Action Required', 
                icon: 'fa-tasks',
                color: 'yellow'
              },
              { 
                number: notifications.filter(n => n.read).length, 
                label: 'Read Messages', 
                icon: 'fa-check-double',
                color: 'green'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`stat-card bg-${stat.color}-50 border border-${stat.color}-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
                variants={itemVariants}
              >
                <div className={`stat-icon w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fas ${stat.icon} text-${stat.color}-600 text-xl`}></i>
                </div>
                <span className={`stat-number text-3xl font-bold text-${stat.color}-600 block mb-2`}>
                  {stat.number}
                </span>
                <span className="stat-label text-gray-700 text-sm font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="cta-section py-16 bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-2xl shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <motion.h2
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Need More Support?
            </motion.h2>
            <motion.p
              className="text-xl max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Connect with our community or talk to a moderator for personalized guidance.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/about"
                className="inline-block bg-white text-green-700 py-3 px-6 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg transform hover:-translate-y-1"
              >
                know more about us 
              </Link>
              <Link
                to="/moderator"
                className="inline-block border-2 border-white text-white py-3 px-6 rounded-full font-bold text-lg hover:bg-white hover:text-green-700 transition-colors duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Talk to Moderator
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Notifications;