import axios from 'axios';
import { getAuthHeaders, API_BASE } from '../utils/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Submit contact form data
 * @param {Object} formData - The contact form data
 * @param {string} formData.name - User's name
 * @param {string} formData.email - User's email
 * @param {string} formData.subject - Message subject
 * @param {string} formData.message - Message content
 * @returns {Promise<Object>} Response data
 */
async function submitContactForm(formData) {
  try {
    // Check if user is authenticated
    const headers = getAuthHeaders();
    if (headers.Authorization) {
      // Authenticated user - send message directly to moderator
      const response = await api.post('/contact/authenticated', formData, {
        headers: headers
      });
      return response.data;
    } else {
      // Unauthenticated user - use public contact form
      const response = await api.post('/contact', formData);
      return response.data;
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit contact form');
  }
}

/**
 * Respond to a contact form submission (moderator only)
 * @param {string} messageId - The ID of the contact form message
 * @param {string} response - The moderator's response
 * @returns {Promise<Object>} Response data
 */
async function respondToContactForm(messageId, response) {
  try {
    const headers = getAuthHeaders();
    const responseData = { messageId, response };
    const result = await api.post('/contact/respond', responseData, {
      headers: headers
    });
    return result.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to send response');
  }
}

export default { submitContactForm, respondToContactForm };