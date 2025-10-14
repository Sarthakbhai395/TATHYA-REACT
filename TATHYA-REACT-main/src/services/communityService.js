import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

export const getCommunityById = async (id) => {
  try {
    const response = await axios.get(`/api/communities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community by ID:', error);
    throw error;
  }
};

export const joinCommunity = async (id) => {
  try {
    const response = await axios.post(`/api/communities/${id}/join`);
    return response.data;
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

export const leaveCommunity = async (id) => {
  try {
    const response = await axios.post(`/api/communities/${id}/leave`);
    return response.data;
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

export const getCommunities = async () => {
  try {
    const response = await axios.get('/api/communities');
    return response.data;
  } catch (error) {
    console.error('Error fetching all communities:', error);
    throw error;
  }
};