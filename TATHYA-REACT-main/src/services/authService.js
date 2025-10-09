const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function signup(data) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Signup failed');
  return json;
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export function setAuthStorage(user) {
  // Save token and user info
  localStorage.setItem('tathya_user', JSON.stringify(user));
  localStorage.setItem('tathya_token', user.token);
  // Mark authenticated state for apps that check simple flag
  localStorage.setItem('tathya-is-authenticated', 'true');
  // Save a simpler user profile used by Home and UI (keeps avatar/name)
  try {
    const profile = {
      avatar: user.avatar || '',
      name: user.fullName || user.email || 'You',
      email: user.email || '',
      role: user.role || 'user',
    };
    localStorage.setItem('user-profile-data', JSON.stringify(profile));
  } catch (e) {
    // ignore
  }
}

export function clearAuthStorage() {
  localStorage.removeItem('tathya_user');
  localStorage.removeItem('tathya_token');
  localStorage.removeItem('tathya-is-authenticated');
  localStorage.removeItem('user-profile-data');
}

export function getAuthUser() {
  return JSON.parse(localStorage.getItem('tathya_user') || 'null');
}

export default { signup, login, setAuthStorage, clearAuthStorage, getAuthUser };
