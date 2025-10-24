import axios from 'axios';
import { API_BASE } from '../utils/api';

// Create axios instance with base URL
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

async function createPost(formData) {
  try {
    const response = await api.post('/posts', formData, {
      headers: {
        // Do not set Content-Type; browser will set multipart boundary
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create post');
  }
}

async function fetchPostsByCommunity(communityId, page = 1) {
  try {
    const response = await api.get(`/posts/community/${communityId}?pageNumber=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch posts');
  }
}

async function fetchRecentPosts(page = 1) {
  try {
    const response = await api.get(`/posts?pageNumber=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch recent posts');
  }
}

async function likePost(postId) {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to like post');
  }
}

// New function to pin/unpin a post
async function pinPost(postId) {
  try {
    const response = await api.post(`/posts/${postId}/pin`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to pin post');
  }
}

async function deletePost(postId) {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete post');
  }
}

async function addComment(postId, content, replyTo = null) {
  try {
    const body = { content };
    if (replyTo) body.replyTo = replyTo;
    const response = await api.post(`/posts/${postId}/comments`, body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
  }
}

async function likeComment(postId, commentId, replyId = null) {
  try {
    const url = replyId
      ? `/posts/${postId}/comments/${commentId}/replies/${replyId}/like`
      : `/posts/${postId}/comments/${commentId}/like`;
    const response = await api.post(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to like comment');
  }
}

export default { createPost, fetchPostsByCommunity, fetchRecentPosts, likePost, pinPost, deletePost, addComment, likeComment };