import { API_BASE, getAuthHeaders } from '../utils/api';

async function createPost({ title, content, communityId = '', isAnonymous = true, files = [] }) {
  // files: array of File objects
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('isAnonymous', isAnonymous ? 'true' : 'false');
  if (communityId) formData.append('communityId', communityId);
  files.forEach((f) => formData.append('attachments', f));

  const headers = getAuthHeaders();

  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      ...headers,
      // Do not set Content-Type; browser will set multipart boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create post');
  }

  return res.json();
}

async function fetchPostsByCommunity(communityId, page = 1) {
  const res = await fetch(`${API_BASE}/posts/community/${communityId}?pageNumber=${page}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch posts');
  }
  return res.json();
}

async function fetchRecentPosts(page = 1) {
  const res = await fetch(`${API_BASE}/posts?pageNumber=${page}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch recent posts');
  }
  return res.json();
}

export default { createPost, fetchPostsByCommunity, fetchRecentPosts };
