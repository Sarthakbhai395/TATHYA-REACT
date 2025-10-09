export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('tathya_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default { API_BASE, getAuthHeaders };
