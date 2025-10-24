import axios from 'axios';
import { API_BASE, getAuthHeaders } from '../utils/api';

const API_URL = `${API_BASE}/notifications`;

// Get all notifications for the current user
export const getNotifications = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markAsRead = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create a new notification (for testing purposes)
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(API_URL, notificationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};