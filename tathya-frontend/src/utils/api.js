// API base URL - updated to use correct port
export const API_BASE = 'http://localhost:5000/api';

// Helper function to get authentication headers
export function getAuthHeaders() {
  const token = localStorage.getItem('tathya_token');
  console.log('Retrieved token from localStorage:', token);
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
  console.log('Generated headers:', headers);
  return headers;
}