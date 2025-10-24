// src/services/messageService.js
import axios from 'axios';
import { API_BASE, getAuthHeaders } from '../utils/api';

// Fetch user messages
export const getUserMessages = async () => {
  try {
    const headers = getAuthHeaders();
    console.log('Fetching messages with headers:', headers);
    const response = await axios.get(`${API_BASE}/messages`, {
      headers: headers
    });
    console.log('Messages response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    console.error('Error details:', error);
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('tathya_token');
      localStorage.removeItem('tathya_user');
      localStorage.removeItem('tathya-is-authenticated');
      window.location.href = '/login';
    }
    throw new Error('Failed to fetch messages');
  }
};

// Send a message
export const sendMessage = async (to, content) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE}/messages`, { to, content }, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('tathya_token');
      localStorage.removeItem('tathya_user');
      localStorage.removeItem('tathya-is-authenticated');
      window.location.href = '/login';
    }
    throw new Error('Failed to send message');
  }
};

// Fetch messages between two users (for moderator dashboard)
export const getMessagesBetweenUsers = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE}/messages`, {
      headers: headers
    });
    // Filter messages between current user and specified user
    const filteredMessages = response.data.filter(msg => 
      (msg.from._id === localStorage.getItem('tathya_user') && msg.to._id === userId) ||
      (msg.from._id === userId && msg.to._id === localStorage.getItem('tathya_user'))
    );
    return filteredMessages;
  } catch (error) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('tathya_token');
      localStorage.removeItem('tathya_user');
      localStorage.removeItem('tathya-is-authenticated');
      window.location.href = '/login';
    }
    throw new Error('Failed to fetch messages');
  }
};