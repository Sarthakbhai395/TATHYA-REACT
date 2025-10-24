const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Get user profile data
export async function getUserProfile() {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch profile');
  return json;
}

// Update user profile
export async function updateUserProfile(profileData) {
  const token = localStorage.getItem('tathya_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body;
  if (profileData instanceof FormData) {
    body = profileData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(profileData);
  }

  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: headers,
    body: body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update profile');
  return json;
}

// Get user documents
export async function getUserDocuments() {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/documents/my-documents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch documents');
  return json;
}

// Upload document
export async function uploadDocument(formData) {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to upload document');
  return json;
}

// Delete document
export async function deleteDocument(documentId) {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete document');
  return json;
}

// Get user reports
export async function getUserReports() {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/reports/my-reports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch reports');
  return json;
}

// Create new report
export async function createReport(reportData) {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(reportData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create report');
  return json;
}

// Get user resume data
export async function getUserResume() {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/resume`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch resume');
  return json;
}

// Save user resume data
export async function saveUserResume(resumeData) {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(resumeData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to save resume');
  return json;
}

// Get user activities
export async function getUserActivities() {
  const token = localStorage.getItem('tathya_token');
  const res = await fetch(`${API_BASE}/activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch activities');
  return json;
}

// Get user contact queries
export async function getUserContactQueries() {
  const token = localStorage.getItem('tathya_token');
  console.log('Fetching contact queries with token:', token);
  const res = await fetch(`${API_BASE}/messages/contact-queries`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  console.log('Contact queries response status:', res.status);
  const json = await res.json();
  console.log('Contact queries response data:', json);
  if (!res.ok) throw new Error(json.message || 'Failed to fetch contact queries');
  return json;
}

export default {
  getUserProfile,
  updateUserProfile,
  getUserDocuments,
  uploadDocument,
  deleteDocument,
  getUserReports,
  createReport,
  getUserResume,
  saveUserResume,
  getUserActivities,
  getUserContactQueries
};