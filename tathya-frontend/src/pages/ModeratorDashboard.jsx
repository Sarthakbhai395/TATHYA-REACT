import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getUserMessages, sendMessage as sendUserMessage } from '../services/messageService';
import socketService from '../services/socketService';
import contactService from '../services/contactService';

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [moderatorMessages, setModeratorMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // API base URL
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  // --- Format timestamp helper function ---
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to generate unique avatar based on user information
  const generateUniqueAvatar = (user) => {
    // Use user ID or email to create a consistent hash
    const identifier = user._id || user.email || user.fullName || 'unknown';
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate unique color based on hash
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const backgroundColor = colors[Math.abs(hash) % colors.length];
    
    // Get initials from user name
    let initials = '??';
    if (user.fullName) {
      const names = user.fullName.split(' ');
      initials = names[0].charAt(0).toUpperCase();
      if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
      }
    } else if (user.email) {
      initials = user.email.charAt(0).toUpperCase();
    }
    
    // Create SVG data URL for avatar
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${backgroundColor}" rx="50"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="white" font-weight="bold">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('tathya_token');
    const user = localStorage.getItem('tathya_user');
    console.log('Auth check - Token:', token ? 'Exists' : 'Missing');
    console.log('Auth check - User:', user ? 'Exists' : 'Missing');
    
    if (!token || !user) {
      console.log('Redirecting to login - missing auth');
      window.location.href = '/login';
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    // Handle receiving messages
    const handleReceiveMessage = (message) => {
      console.log('Moderator Dashboard: Received message via socket:', message);
      
      // Update messages if we're in the messages tab
      if (activeTab === 'messages') {
        setModeratorMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
      
      // Also scroll to bottom if we're in the messages tab and have a selected user
      if (activeTab === 'messages' && selectedUser) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    };
    
    // Handle message sent confirmation
    const handleMessageSent = (message) => {
      console.log('Moderator Dashboard: Message sent confirmation via socket:', message);
      
      // Update messages if we're in the messages tab
      if (activeTab === 'messages') {
        setModeratorMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
      
      // Clear input
      setMessageInput('');
      setSendingMessage(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };
    
    socketService.onMessageReceived(handleReceiveMessage);
    socketService.onMessageSent(handleMessageSent);
    
    return () => {
      socketService.offMessageReceived(handleReceiveMessage);
      socketService.offMessageSent(handleMessageSent);
    };
  }, [activeTab, selectedUser]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [moderatorMessages]);

  // Poll for new messages when in chat tab
  useEffect(() => {
    let interval;
    if (activeTab === 'messages' && selectedUser) {
      // Check for new messages every 5 seconds
      interval = setInterval(() => {
        fetchMessagesForUser(selectedUser._id);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts for moderation (all posts, including unapproved ones)
      const postsRes = await axios.get(`${API_BASE}/posts/moderation`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
        }
      });
      
      // The response might be in different formats depending on the backend
      const postsData = postsRes.data.posts || postsRes.data;
      setPosts(Array.isArray(postsData) ? postsData : []);
      
      // Fetch users from moderator endpoint
      const usersRes = await axios.get(`${API_BASE}/moderator/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
        }
      });
      setUsers(usersRes.data);
      
      // Fetch moderator messages from moderator endpoint
      const messagesRes = await axios.get(`${API_BASE}/moderator/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
        }
      });
      setModeratorMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle 401 error by redirecting to login
      if (error.response?.status === 401) {
        localStorage.removeItem('tathya_token');
        localStorage.removeItem('tathya_user');
        localStorage.removeItem('tathya-is-authenticated');
        window.location.href = '/login';
      } else {
        alert('Failed to fetch data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch messages for a specific user
  const fetchMessagesForUser = async (userId) => {
    try {
      const messagesRes = await axios.get(`${API_BASE}/moderator/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
        }
      });
      
      // Filter messages between current user and selected user
      const filteredMessages = messagesRes.data.filter(msg => 
        (msg.from._id === localStorage.getItem('tathya_user') && msg.to._id === userId) ||
        (msg.from._id === userId && msg.to._id === localStorage.getItem('tathya_user'))
      );
      
      // Sort messages by timestamp (oldest first for display)
      const sortedMessages = [...filteredMessages].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      setModeratorMessages(sortedMessages);
      
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle 401 error by redirecting to login
      if (error.response?.status === 401) {
        localStorage.removeItem('tathya_token');
        localStorage.removeItem('tathya_user');
        localStorage.removeItem('tathya-is-authenticated');
        window.location.href = '/login';
      }
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const response = await axios.put(`${API_BASE}/moderator/posts/${postId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
        }
      });
      
      // Update local state
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, approved: true } : post
      ));
      
      // Show success message
      alert('Post approved successfully');
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        await axios.delete(`${API_BASE}/moderator/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
          }
        });
        
        // Update local state
        setPosts(posts.filter(post => post._id !== postId));
        
        // Show success message
        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || sendingMessage) return;

    setSendingMessage(true);
    
    try {
      // Create a temporary message object for immediate display
      const tempMessage = {
        _id: Date.now().toString(), // Temporary ID
        from: { _id: localStorage.getItem('tathya_user') },
        to: { _id: selectedUser._id },
        content: messageInput,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Immediately add to UI for better UX
      setModeratorMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Try to send via Socket.IO first
      const currentUser = JSON.parse(localStorage.getItem('tathya_user'));
      const messageData = {
        from: currentUser._id,
        to: selectedUser._id,
        content: messageInput
      };
      
      const socketSuccess = socketService.sendMessage(messageData);
      
      if (!socketSuccess) {
        // Fallback to REST API
        const response = await axios.post(`${API_BASE}/moderator/messages`, {
          to: selectedUser._id,
          content: messageInput
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tathya_token')}`
          }
        });

        // Update local state with the new message from backend
        setModeratorMessages(prev => {
          // Remove temporary message and add the real one
          return [...prev.filter(msg => msg._id !== tempMessage._id), response.data];
        });
        setMessageInput('');
      } else {
        // Clear input since Socket.IO will handle the confirmation
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle 401 error by redirecting to login
      if (error.response?.status === 401) {
        localStorage.removeItem('tathya_token');
        localStorage.removeItem('tathya_user');
        localStorage.removeItem('tathya-is-authenticated');
        window.location.href = '/login';
      } else {
        alert('Failed to send message: ' + (error.response?.data?.message || error.message));
        // Remove temporary message on error
        setModeratorMessages(prevMessages => 
          prevMessages.filter(msg => !msg._id || !msg._id.toString().startsWith(Date.now().toString()))
        );
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const selectUserForChat = (user) => {
    setSelectedUser(user);
    // Fetch messages for this user
    fetchMessagesForUser(user._id);
    // Scroll to chat area
    setTimeout(() => {
      const chatArea = document.getElementById('chat-area');
      if (chatArea) {
        chatArea.scrollIntoView({ behavior: 'smooth' });
      }
      // Also scroll to bottom of messages
      scrollToBottom();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-user-shield text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Moderator Dashboard</h1>
                <p className="text-gray-600">Manage posts, users, and communications</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <i className="fas fa-file-alt text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-gray-800">{posts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <i className="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <i className="fas fa-comments text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Messages</p>
                <p className="text-2xl font-bold text-gray-800">{moderatorMessages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <i className="fas fa-envelope-open-text text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Contact Forms</p>
                <p className="text-2xl font-bold text-gray-800">
                  {moderatorMessages.filter(msg => 
                    msg.from.email === 'contact@tathya.edu'
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i>Post Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-users mr-2"></i>User Management
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>Moderator Chat
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                activeTab === 'contact'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>Contact Forms
            </button>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Post Management Tab */}
            {activeTab === 'posts' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Post Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-800 truncate">{post.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              post.approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {post.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex justify-between">
                          <button
                            onClick={() => handleApprovePost(post._id)}
                            disabled={post.approved}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              post.approved
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            <i className="fas fa-check mr-1"></i>Approve
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                          >
                            <i className="fas fa-trash mr-1"></i>Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">No posts to moderate</h3>
                      <p className="text-gray-500">All posts are currently approved or there are no posts yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-gray-700 font-semibold">User</th>
                        <th className="py-3 px-4 text-left text-gray-700 font-semibold">Email</th>
                        <th className="py-3 px-4 text-left text-gray-700 font-semibold">Role</th>
                        <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                        <th className="py-3 px-4 text-left text-gray-700 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img
                                src={user.avatar || generateUniqueAvatar(user)}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full mr-3 object-cover"
                              />
                              <div>
                                <div className="text-gray-800 font-medium">{user.fullName}</div>
                                <div className="text-gray-500 text-sm">{user.phone || 'No phone'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'moderator'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.isVerified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => selectUserForChat(user)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                            >
                              <i className="fas fa-comment mr-1"></i>Message
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Moderator Chat Tab */}
            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="flex h-[600px]">
                  {/* Users List */}
                  <div className="w-1/3 border-r border-gray-200 bg-gray-50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <h2 className="text-xl font-bold text-gray-800">Users</h2>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-60px)]">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => selectUserForChat(user)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white ${
                            selectedUser?._id === user._id ? 'bg-white border-l-4 border-l-blue-600' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <img
                              src={user.avatar || generateUniqueAvatar(user)}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-800 font-medium truncate">{user.fullName}</div>
                              <div className="text-gray-500 text-sm truncate">{user.email}</div>
                            </div>
                            {user.role === 'moderator' && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Mod
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                      <>
                        <div className="p-4 border-b border-gray-200 bg-white">
                          <div className="flex items-center">
                            <img
                              src={selectedUser.avatar || generateUniqueAvatar(selectedUser)}
                              alt={selectedUser.fullName}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <div>
                              <div className="text-gray-800 font-medium">{selectedUser.fullName}</div>
                              <div className="text-gray-500 text-sm">Online</div>
                            </div>
                          </div>
                        </div>
                        <div 
                          id="chat-area"
                          className="flex-1 overflow-y-auto p-4 bg-gray-50"
                        >
                          {[...moderatorMessages]
                            .filter(msg => 
                              (msg.from._id === localStorage.getItem('tathya_user') && msg.to._id === selectedUser._id) ||
                              (msg.from._id === selectedUser._id && msg.to._id === localStorage.getItem('tathya_user'))
                            )
                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                            .map((msg) => (
                              <div
                                key={msg._id}
                                className={`mb-4 flex ${
                                  msg.from._id === localStorage.getItem('tathya_user') ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                    msg.from._id === localStorage.getItem('tathya_user')
                                      ? 'bg-blue-600 text-white rounded-br-none'
                                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                  }`}
                                >
                                  <div className="message-content">{msg.content}</div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      msg.from._id === localStorage.getItem('tathya_user') ? 'text-blue-200' : 'text-gray-500'
                                    }`}
                                  >
                                    {formatTimestamp(msg.timestamp)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <div className="flex">
                            <input
                              type="text"
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !posting && handleSendMessage()}
                              placeholder="Type your message..."
                              className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                              disabled={posting}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={posting || !messageInput.trim()}
                              className={`px-4 rounded-r-lg ${
                                posting || !messageInput.trim()
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {posting ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-paper-plane"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                          <h3 className="text-xl font-medium text-gray-700 mb-2">Select a user to chat</h3>
                          <p className="text-gray-500">Choose a user from the list to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Forms Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Form Submissions</h2>
                <div className="overflow-x-auto">
                  {moderatorMessages.filter(msg => 
                    (msg.from.email === 'contact@tathya.edu' && msg.content.includes('Contact Form Submission:')) || 
                    (msg.from.role === 'user' && msg.content.includes('Subject:'))
                  ).length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-gray-700 font-semibold">Name</th>
                          <th className="py-3 px-4 text-left text-gray-700 font-semibold">Email</th>
                          <th className="py-3 px-4 text-left text-gray-700 font-semibold">Subject</th>
                          <th className="py-3 px-4 text-left text-gray-700 font-semibold">Date</th>
                          <th className="py-3 px-4 text-left text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...moderatorMessages]
                          .filter(msg => 
                            (msg.from.email === 'contact@tathya.edu' && msg.content.includes('Contact Form Submission:')) || 
                            (msg.from.role === 'user' && msg.content.includes('Subject:'))
                          )
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .map((msg) => {
                            // Parse contact form data from message content
                            const lines = msg.content.split('\n');
                            let name, email, subject, messageContent;
                            
                            // Check if this is a public contact form (from contact@tathya.edu)
                            if (msg.from.email === 'contact@tathya.edu' && msg.content.includes('Contact Form Submission:')) {
                              const nameLine = lines.find(line => line.startsWith('Name:'));
                              const emailLine = lines.find(line => line.startsWith('Email:'));
                              const subjectLine = lines.find(line => line.startsWith('Subject:'));
                              
                              name = nameLine ? nameLine.replace('Name: ', '') : 'N/A';
                              email = emailLine ? emailLine.replace('Email: ', '') : 'N/A';
                              subject = subjectLine ? subjectLine.replace('Subject: ', '') : 'N/A';
                              
                              // Extract message content (everything after "Message:")
                              const messageStartIndex = lines.findIndex(line => line.startsWith('Message:'));
                              messageContent = messageStartIndex > -1 
                                ? lines.slice(messageStartIndex + 1).join('\n').trim() 
                                : 'No message content';
                            } else {
                              // This is an authenticated user contact form
                              name = msg.from.fullName || 'N/A';
                              email = msg.from.email || 'N/A';
                              
                              // Parse subject from authenticated contact form
                              const subjectLine = lines.find(line => line.includes('Subject:'));
                              subject = subjectLine ? subjectLine.replace('Subject: ', '').trim() : 'Contact Form Submission';
                              
                              // Extract message content (everything after "Message:")
                              const messageStartIndex = lines.findIndex(line => line.includes('Message:'));
                              messageContent = messageStartIndex > -1 
                                ? lines.slice(messageStartIndex + 1).join('\n').trim() 
                                : msg.content;
                            }
                            
                            return (
                              <tr key={msg._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-800 font-medium">{name}</td>
                                <td className="py-3 px-4 text-gray-600">{email}</td>
                                <td className="py-3 px-4 text-gray-800">{subject}</td>
                                <td className="py-3 px-4 text-gray-500">
                                  {formatTimestamp(msg.timestamp)}
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => {
                                      // Show response modal
                                      const response = prompt(`Respond to ${name} (${email}):

Original message:
${messageContent}

Your response:`);
                                      if (response) {
                                        // Send response
                                        contactService.respondToContactForm(msg._id, response)
                                          .then(() => {
                                            alert('Response sent successfully!');
                                            // Refresh messages
                                            fetchData();
                                          })
                                          .catch(error => {
                                            alert('Failed to send response: ' + error.message);
                                          });
                                      }
                                    }}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                  >
                                    <i className="fas fa-reply mr-1"></i>Respond
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-envelope-open-text text-4xl text-gray-300 mb-4"></i>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">No contact form submissions</h3>
                      <p className="text-gray-500">Contact form submissions will appear here when users submit the contact form.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;