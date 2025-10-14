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
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts/community/${communityId}?pageNumber=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch posts');
  }
  return res.json();
}

async function fetchRecentPosts(page = 1) {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts?pageNumber=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch recent posts');
  }
  return res.json();
}

async function likePost(postId) {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to like post');
  }
  return res.json();
}

async function deletePost(postId) {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to delete post');
  }
  return res.json();
}

async function addComment(postId, content, replyTo = null) {
  const headers = getAuthHeaders();
  const body = { content };
  if (replyTo) body.replyTo = replyTo;
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to add comment');
  }
  return res.json();
}

async function likeComment(postId, commentId, replyId = null) {
  const headers = getAuthHeaders();
  const url = replyId
    ? `${API_BASE}/posts/${postId}/comments/${commentId}/replies/${replyId}/like`
    : `${API_BASE}/posts/${postId}/comments/${commentId}/like`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to like comment');
  }
  return res.json();
}

export default { createPost, fetchPostsByCommunity, fetchRecentPosts, likePost, deletePost, addComment, likeComment };
