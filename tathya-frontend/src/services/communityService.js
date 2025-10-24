import axios from 'axios';
import { API_BASE } from '../utils/api';

// Use the correct backend port
const api = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tathya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to get auth headers (kept for backward compatibility)
const getAuthHeaders = () => {
  const token = localStorage.getItem('tathya_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCommunityById = async (id) => {
  try {
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]+$/.test(id)) {
      throw new Error('Invalid community ID format');
    }
    
    const response = await api.get(`/communities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community by ID:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    } else if (error.response && error.response.status === 400) {
      throw new Error('Invalid community ID format');
    } else if (error.response && error.response.status === 404) {
      throw new Error('Community not found');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch community data. Please try again later.');
    }
  }
};

export const joinCommunity = async (id) => {
  try {
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]+$/.test(id)) {
      throw new Error('Invalid community ID format');
    }
    
    const response = await api.post(`/communities/${id}/join`, {});
    return response.data;
  } catch (error) {
    console.error('Error joining community:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    } else if (error.response && error.response.status === 400) {
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Invalid community ID format');
    } else if (error.response && error.response.status === 401) {
      throw new Error('You must be logged in to join a community');
    } else if (error.response && error.response.status === 404) {
      throw new Error('Community not found');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to join community. Please try again later.');
    }
  }
};

export const leaveCommunity = async (id) => {
  try {
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]+$/.test(id)) {
      throw new Error('Invalid community ID format');
    }
    
    const response = await api.post(`/communities/${id}/leave`, {});
    return response.data;
  } catch (error) {
    console.error('Error leaving community:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    } else if (error.response && error.response.status === 400) {
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Invalid community ID format');
    } else if (error.response && error.response.status === 401) {
      throw new Error('You must be logged in to leave a community');
    } else if (error.response && error.response.status === 404) {
      throw new Error('Community not found');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to leave community. Please try again later.');
    }
  }
};

export const getCommunities = async () => {
  try {
    const response = await api.get('/communities');
    return response.data;
  } catch (error) {
    console.error('Error fetching all communities:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch communities. Please try again later.');
    }
  }
};

export const createCommunity = async (communityData) => {
  try {
    const response = await api.post('/communities', communityData);
    return response.data;
  } catch (error) {
    console.error('Error creating community:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    } else if (error.response && error.response.status === 400) {
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Invalid community data');
    } else if (error.response && error.response.status === 401) {
      throw new Error('You must be logged in to create a community');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create community. Please try again later.');
    }
  }
};