// src/pages/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const NotificationCard = ({ stat, index, itemVariants }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          background: 'bg-blue-50',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-100',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          numberColor: 'text-blue-600'
        };
      case 'red':
        return {
          background: 'bg-red-50',
          border: 'border-red-200',
          hover: 'hover:bg-red-100',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          numberColor: 'text-red-600'
        };
      case 'yellow':
        return {
          background: 'bg-yellow-50',
          border: 'border-yellow-200',
          hover: 'hover:bg-yellow-100',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          numberColor: 'text-yellow-600'
        };
      default:
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          hover: 'hover:bg-green-100',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          numberColor: 'text-green-600'
        };
    }
  };

  const colors = getColorClasses(stat.color);

  return (
    <motion.div
      key={index}
      className={`group p-6 rounded-xl border shadow-md cursor-pointer ${colors.background} ${colors.border} ${colors.hover}`}
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${colors.iconBg} group-hover:rotate-12 transition-all duration-300`}>
        <i className={`fas ${stat.icon} text-xl ${colors.iconColor}`}></i>
      </div>
      <span className={`text-3xl font-bold block mb-2 ${colors.numberColor}`}>
        {stat.number}
      </span>
      <span className="text-sm font-medium text-gray-700">
        {stat.label}
      </span>
    </motion.div>
  );
};

const Notifications = () => {
  // ... rest of your existing state and functions ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* ... other sections ... */}

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
            <NotificationCard 
              key={index}
              stat={stat}
              index={index}
              itemVariants={itemVariants}
            />
          ))}
        </div>
      </motion.section>

      {/* ... rest of your component ... */}
    </div>
  );
};

export default Notifications;