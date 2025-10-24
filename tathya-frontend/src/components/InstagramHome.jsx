import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  PlusSquare, 
  ChevronLeft,
  ChevronRight,
  Play,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import postService from '../services/postService';
import { getAuthUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const InstagramHome = () => {
  const [userLikedPosts, setUserLikedPosts] = useState(new Set()); // Track which posts current user has liked
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentBox, setCommentBox] = useState({ postId: null, replyTo: null, replyToUser: null });
  const [commentText, setCommentText] = useState('');
  const [shareModal, setShareModal] = useState({ open: false, post: null });
  const [createPostModal, setCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postFiles, setPostFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState({}); // Track current media index for each post
  const [expandedComments, setExpandedComments] = useState({}); // Track which post comments are expanded
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = getAuthUser();
  const uid = currentUser && (currentUser._id || currentUser.id || currentUser.userId || (currentUser.user && (currentUser.user._id || currentUser.user.id)));

  // Load posts from backend
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const json = await postService.fetchRecentPosts();
      const normalized = (json.posts || []).map(normalizePost);
      
      // Initialize userLikedPosts based on currentUserLiked property
      const newUserLikedPosts = new Set();
      normalized.forEach(post => {
        if (post.currentUserLiked) {
          newUserLikedPosts.add(post._id);
        }
      });
      setUserLikedPosts(newUserLikedPosts);
      
      // Sort posts to show pinned posts first
      const sortedPosts = [...normalized].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // normalize various id shapes to string
  const normalizePost = (p) => {
    if (!p || typeof p !== 'object') return p;
    
    // Separate images and videos from attachments
    const images = [];
    const videos = [];
    
    if (p.attachments && Array.isArray(p.attachments)) {
      p.attachments.forEach(attachment => {
        if (attachment.mimetype && attachment.path) {
          if (attachment.mimetype.startsWith('image/')) {
            // Make sure the path is absolute
            const imagePath = attachment.path.startsWith('http') ? attachment.path : `http://localhost:5000${attachment.path}`;
            images.push(imagePath);
          } else if (attachment.mimetype.startsWith('video/')) {
            // Make sure the path is absolute
            const videoPath = attachment.path.startsWith('http') ? attachment.path : `http://localhost:5000${attachment.path}`;
            videos.push(videoPath);
          }
        }
      });
    }
    
    // Extract user information with better fallbacks
    const postUser = p.user || {};
    const username = p.username || postUser.username || postUser.name || postUser.email || "Anonymous";
    
    // Generate unique avatar based on username
    const generateAvatar = (username) => {
      // Create a hash from the username to determine avatar properties
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Use the hash to generate consistent but unique avatar properties
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      
      const backgroundColor = colors[Math.abs(hash) % colors.length];
      
      // Generate a simple avatar with initials
      const initials = username.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
      
      // Create SVG data URL for the avatar
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
          <rect width="150" height="150" fill="${backgroundColor}"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="white">${initials}</text>
        </svg>
      `;
      
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };
    
    // Use provided avatar or generate unique one
    const avatar = p.avatar || postUser.avatar || generateAvatar(username);
    
    // Determine if current user has liked this post
    const currentUserLiked = uid && p.likes && p.likes.some(likeId => 
      likeId.toString() === uid.toString());
    
    return {
      ...p,
      // Include role and avatar information if available
      role: p.role || postUser.role || null,
      avatar: avatar,
      username: username,
      // Keep the actual likedBy data for tracking user likes
      likedBy: p.likes || [], // Keep the actual likedBy array
      likes: (p.likes || []).length, // Show the count
      currentUserLiked: currentUserLiked, // Track if current user liked this post
      images: images,
      videos: videos,
      comments: Array.isArray(p.comments) ? p.comments.map(comment => {
        const commentUser = comment.user || {};
        const commentUsername = comment.username || commentUser.username || commentUser.name || commentUser.email || "Anonymous";
        const commentAvatar = comment.avatar || commentUser.avatar || generateAvatar(commentUsername);
        
        return {
          ...comment,
          role: comment.role || commentUser.role || null,
          avatar: commentAvatar,
          username: commentUsername,
          likes: (comment.likes || []).length,
          likedBy: comment.likes || [], // Keep the actual likedBy array
          currentUserLiked: uid && comment.likes && comment.likes.some(likeId => 
            likeId.toString() === uid.toString()), // Track if current user liked this comment
          replies: Array.isArray(comment.replies) ? comment.replies.map(reply => {
            const replyUser = reply.user || {};
            const replyUsername = reply.username || replyUser.username || replyUser.name || replyUser.email || "Anonymous";
            const replyAvatar = reply.avatar || replyUser.avatar || generateAvatar(replyUsername);
            
            return {
              ...reply,
              role: reply.role || replyUser.role || null,
              avatar: replyAvatar,
              username: replyUsername,
              likes: (reply.likes || []).length,
              likedBy: reply.likes || [], // Keep the actual likedBy array
              currentUserLiked: uid && reply.likes && reply.likes.some(likeId => 
                likeId.toString() === uid.toString()), // Track if current user liked this reply
            };
          }) : []
        };
      }) : [],
      attachments: Array.isArray(p.attachments) ? p.attachments : [],
      isPinned: p.isPinned || false, // Add pinned status
    };
  };

  const toggleLike = async (postId) => {
    if (!uid) {
      alert('Please login to like posts');
      navigate('/login');
      return;
    }

    // Get the current post to determine if it's already liked
    const currentPost = posts.find(p => p._id === postId);
    if (!currentPost) return;

    // Determine if we're liking or unliking
    const isCurrentlyLiked = currentPost.currentUserLiked;
    
    try {
      // Update UI immediately for better UX
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        
        let newLikedBy;
        let newLikes;
        
        if (isCurrentlyLiked) {
          // Unlike - remove user from likedBy
          newLikedBy = p.likedBy.filter(id => id.toString() !== uid);
          newLikes = p.likes - 1;
        } else {
          // Like - add user to likedBy
          newLikedBy = [...p.likedBy, uid];
          newLikes = p.likes + 1;
        }
        
        return {
          ...p,
          likes: newLikes,
          likedBy: newLikedBy,
          currentUserLiked: !isCurrentlyLiked
        };
      }));
      
      // Send request to backend
      const response = await postService.likePost(postId);
      console.log('Like post response:', response);
      
      // Update UI with the response from backend to ensure consistency
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        
        return {
          ...p,
          likes: response.likes,
          likedBy: response.likedBy || [],
          currentUserLiked: response.likedBy && response.likedBy.some(id => id.toString() === uid)
        };
      }));
      
      // Update userLikedPosts based on backend response
      setUserLikedPosts(prev => {
        const newSet = new Set(prev);
        const isNowLiked = response.likedBy && response.likedBy.some(id => id.toString() === uid);
        if (isNowLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Error liking post:', err);
      alert('Failed to like post: ' + err.message);
      // Revert UI changes on error
      await loadPosts();
    }
  };

  const toggleSave = (postId) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Add share modal functions
  const openShareModal = (post) => {
    setShareModal({ open: true, post });
  };

  const closeShareModal = () => {
    setShareModal({ open: false, post: null });
  };

  const handleShareAction = (platform) => {
    const post = shareModal.post;
    if (!post) return;
    
    // Get the current page URL
    const pageUrl = window.location.origin + `/#/posts/${post._id}`;
    const text = encodeURIComponent(`${post.title || ''} - ${post.content || ''}`);
    const url = encodeURIComponent(pageUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%0A${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(post.title||'Check out this post')}&body=${text}%0A${pageUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(pageUrl);
        alert('Link copied to clipboard!');
        closeShareModal();
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const openCommentBox = (postId, replyTo = null, replyToUser = null) => {
    if (!uid) { 
      alert('Please login to comment'); 
      navigate('/login'); 
      return; 
    }
    setCommentBox({ postId, replyTo, replyToUser });
    setCommentText(replyToUser ? `@${replyToUser} ` : '');
  };

  // Function to toggle comment visibility
  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    const { postId, replyTo } = commentBox;
    try {
      // Submit to backend
      const res = await postService.addComment(postId, commentText.trim(), replyTo);
      
      // Reload posts to get the actual comment from backend
      await loadPosts();
      
      // Reset comment form
      setCommentBox({ postId: null, replyTo: null, replyToUser: null });
      setCommentText('');
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
      // Reload to revert optimistic update
      await loadPosts();
    }
  };

  // Add create post functions
  const openCreatePostModal = () => {
    setCreatePostModal(true);
  };

  const closeCreatePostModal = () => {
    setCreatePostModal(false);
    setPostTitle('');
    setPostContent('');
    
    // Clean up object URLs to prevent memory leaks
    previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    setPostFiles([]);
    setPreviewUrls([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    
    // Append new files to existing files instead of replacing them
    setPostFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles];
      return updatedFiles;
    });
    
    // Create preview URLs for new files only
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...newUrls]);
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() && !postContent.trim() && postFiles.length === 0) {
      alert('Please add a title, content, or files to your post');
      return;
    }
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', postTitle);
      formData.append('content', postContent);
      
      // Add files to formData with the correct field name 'attachments'
      // Filter out any undefined files
      const validFiles = postFiles.filter(file => file !== undefined);
      validFiles.forEach(file => {
        formData.append('attachments', file);
      });
      
      const created = await postService.createPost(formData);
      const createdNormalized = normalizePost(created);
      setPosts(prev => [createdNormalized, ...prev]);
      closeCreatePostModal();
      alert('Post created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create post: ' + (err.message || 'Unknown error'));
    }
  };

  // Function to navigate media in a post carousel
  const navigateMedia = (postId, direction) => {
    setCurrentMediaIndex(prev => {
      const currentPostIndex = prev[postId] || 0;
      // Find the post to get media count
      const post = posts.find(p => p._id === postId);
      if (!post) return prev;
      
      const mediaCount = (post.images?.length || 0) + (post.videos?.length || 0);
      let newIndex = currentPostIndex + direction;
      
      // Handle wrapping
      if (newIndex >= mediaCount) newIndex = 0;
      if (newIndex < 0) newIndex = mediaCount - 1;
      
      return { ...prev, [postId]: newIndex };
    });
  };

  // Function to reset media index when post is viewed
  const handlePostView = (postId) => {
    // Reset the media index for this post when it comes into view
    setCurrentMediaIndex(prev => ({ ...prev, [postId]: 0 }));
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1562907550-096d3bf9b9e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
        backgroundColor: "#f0f2f5"
      }}
    >
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {/* Create Post Button - Moved to top of main content */}
        <div className="flex justify-left mb-10">
          <motion.button
            onClick={openCreatePostModal}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:from-purple-700 hover:to-indigo-800 hover:scale-105"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlusSquare className="w-5 h-5" />
            <span className="font-bold text-lg text-yellow-300">Create Post</span>
          </motion.button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed - Responsive and takes available space */}
          <div className="flex-1 min-w-0">
            {/* Posts Container with smooth animations */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div 
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : posts.length === 0 ? (
                <motion.div 
                  className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Be the first to share your thoughts!</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {posts.map((post, index) => {
                    // Combine images and videos for carousel
                    const allMedia = [...(post.images || []), ...(post.videos || [])];
                    const currentIndex = currentMediaIndex[post._id] || 0;
                    const currentMedia = allMedia[currentIndex];
                    const isVideo = post.videos?.includes(currentMedia);
                    
                    return (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ y: -5 }}
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/30"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <img 
                                src={post.avatar} 
                                alt={post.username}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{post.username}</span>
                              {post.role && (
                                <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full self-start">
                                  {post.role}
                                </span>
                              )}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openShareModal(post)}
                          >
                            <MoreHorizontal 
                              className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            />
                          </motion.button>
                        </div>

                        {/* Post Media Carousel */}
                        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900">
                          {allMedia.length > 0 ? (
                            <>
                              {isVideo ? (
                                <div className="w-full h-full relative">
                                  <video 
                                    src={currentMedia} 
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                    autoPlay={false}
                                  />
                                </div>
                              ) : (
                                <motion.img 
                                  key={`${post._id}-${currentIndex}`}
                                  src={currentMedia} 
                                  alt={`Post media ${currentIndex + 1}`}
                                  className="w-full h-full object-contain bg-black"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                               
                              {/* Navigation Arrows */}
                              {allMedia.length > 1 && (
                                <>
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateMedia(post._id, -1);
                                    }}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all z-10"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <ChevronLeft className="w-6 h-6" />
                                  </motion.button>
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateMedia(post._id, 1);
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all z-10"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <ChevronRight className="w-6 h-6" />
                                  </motion.button>
                                </>
                              )}
                               
                              {/* Media Counter */}
                              {allMedia.length > 1 && (
                                <motion.div 
                                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full z-10"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  {currentIndex + 1} / {allMedia.length}
                                </motion.div>
                              )}
                              
                              {/* Play Icon for Videos */}
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <motion.div 
                                    className="bg-black bg-opacity-50 rounded-full p-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Play className="w-8 h-8 text-white" />
                                  </motion.div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-lg">No media available</span>
                            </div>
                          )}
                        </div>

                        {/* Post Actions */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Heart 
                                  className={`w-7 h-7 cursor-pointer transition-all duration-300 ${userLikedPosts.has(post._id) ? 'fill-red-500 stroke-red-500' : 'text-gray-700 dark:text-gray-300 hover:text-red-500'}`}
                                  onClick={() => toggleLike(post._id)}
                                />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <MessageCircle 
                                  className="w-7 h-7 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors duration-300"
                                  onClick={() => openCommentBox(post._id)}
                                />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Send className="w-7 h-7 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors duration-300" />
                              </motion.button>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Bookmark 
                                className={`w-7 h-7 cursor-pointer transition-all duration-300 ${savedPosts.has(post._id) ? 'fill-blue-600 stroke-blue-600' : 'text-gray-700 dark:text-gray-300 hover:text-blue-500'}`}
                                onClick={() => toggleSave(post._id)}
                              />
                            </motion.button>
                          </div>

                          {/* Likes */}
                          <div className="mb-2">
                            {post.likes > 0 && (
                              <motion.span 
                                className="font-bold text-gray-800 dark:text-gray-200"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {post.likes} likes
                              </motion.span>
                            )}
                          </div>

                          {/* Caption */}
                          <div className="mb-3">
                            <p className="text-gray-700 dark:text-gray-300">
                              {post.content || post.caption || "No caption"}
                            </p>
                          </div>

                          {/* View Comments */}
                          {post.comments && post.comments.length > 0 && (
                            <div className="mb-3">
                              <motion.button
                                className="text-gray-500 dark:text-gray-400 text-sm mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                onClick={() => toggleComments(post._id)}
                                whileHover={{ x: 5 }}
                              >
                                View all {post.comments.length} comments
                              </motion.button>
                               
                              {/* Expanded Comments */}
                              <AnimatePresence>
                                {expandedComments[post._id] && (
                                  <motion.div 
                                    className="space-y-3 max-h-60 overflow-y-auto mt-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-600"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {post.comments.map((comment, index) => (
                                      <motion.div 
                                        key={index} 
                                        className="flex gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                          <img 
                                            src={comment.avatar} 
                                            alt={comment.username}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.username}</span>
                                            {comment.role && (
                                              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
                                                {comment.role}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text || comment.content || "No comment text"}</p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Time */}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Unknown date"}
                          </div>
                        </div>

                        {/* Add Comment */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              className="flex-1 border-0 p-2 h-auto focus:ring-0 focus:ring-offset-0 text-sm bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                              value={commentBox.postId === post._id ? commentText : ""}
                              onChange={(e) => {
                                setCommentText(e.target.value);
                                if (commentBox.postId !== post._id) {
                                  setCommentBox({ postId: post._id, replyTo: null, replyToUser: null });
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && commentBox.postId === post._id) {
                                  submitComment();
                                }
                              }}
                              onClick={() => {
                                // Ensure comment box is open for this post when input is clicked
                                if (commentBox.postId !== post._id) {
                                  setCommentBox({ postId: post._id, replyTo: null, replyToUser: null });
                                }
                              }}
                            />
                            <motion.button 
                              className="text-blue-500 font-medium text-sm hover:text-blue-700 transition-colors"
                              onClick={submitComment}
                              disabled={commentBox.postId !== post._id || !commentText.trim()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Post
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Left Sidebar - Versatile and Responsive */}
          <motion.div 
            className="hidden lg:block w-full lg:w-80 xl:w-96 flex-shrink-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-24 space-y-6">
              {/* About TATHYA Section */}
              <motion.div 
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">About TATHYA</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  TATHYA is a safe and anonymous platform for students to share their academic experiences, seek support, and connect with peers facing similar challenges.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Anonymous posting to protect your identity</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Safe space to discuss academic pressure and harassment</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Peer support and community building</p>
                  </div>
                </div>
              </motion.div>

              {/* Academic Stress Support */}
              <motion.div 
                className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg p-6 border border-indigo-100 dark:border-gray-700"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Academic Support</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Facing academic pressure? You're not alone. Share your experiences and find support from fellow students who understand what you're going through.
                </p>
                
                <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Common Challenges:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Exam stress and anxiety
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Bullying and harassment
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Performance pressure
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Time management issues
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Anonymous Posting Benefits */}
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-gray-700"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Anonymous Benefits</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-purple-600 dark:text-purple-400 mr-3 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Privacy Protection</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Your identity is never revealed, ensuring complete privacy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-purple-600 dark:text-purple-400 mr-3 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Honest Expression</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Speak freely without fear of judgment or consequences.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-purple-600 dark:text-purple-400 mr-3 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Safe Reporting</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Report issues confidently with protection from retaliation.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pb-6">
                <div className="font-semibold">© 2025 TATHYA</div>
                <div className="text-gray-400 dark:text-gray-500 mt-1">Safe Space for Students</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {createPostModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <h3 className="text-xl font-bold">Create New Post</h3>
                <button 
                  onClick={closeCreatePostModal}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Media</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {postFiles.length > 0 ? `${postFiles.length} file(s) selected` : 'Select files'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">You can select multiple images and videos. Select again to add more files.</p>
                </div>
                
                {/* File Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    {previewUrls.map((url, index) => {
                      const file = postFiles[index];
                      // Check if file exists before accessing its properties
                      if (!file) {
                        return (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Invalid file</span>
                            </div>
                          </div>
                        );
                      }
                       
                      return (
                        <div key={`${index}-${file.name}`} className="relative aspect-square rounded-lg overflow-hidden group">
                          {file && file.type && file.type.startsWith('image/') ? (
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center relative">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 dark:bg-opacity-70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              // Create new arrays without the file at this index
                              const newFiles = postFiles.filter((_, i) => i !== index);
                              const newUrls = previewUrls.filter((_, i) => i !== index);
                              
                              // Revoke the object URL for the removed file to prevent memory leaks
                              URL.revokeObjectURL(url);
                              
                              // Update state
                              setPostFiles(newFiles);
                              setPreviewUrls(newUrls);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeCreatePostModal}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal.open && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <h3 className="text-xl font-bold">Share Post</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <motion.button 
                    onClick={() => handleShareAction('whatsapp')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShareAction('facebook')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Facebook</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShareAction('twitter')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Twitter</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShareAction('telegram')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-400 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.141-.259.259-.374.261l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.57-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Telegram</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShareAction('linkedin')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShareAction('email')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-500 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                        <path d="M22.5 6.162v-3.58a3 3 0 00-3-3h-15a3 3 0 00-3 3v3.582l9.428 5.927a3 3 0 003.144 0l9.428-5.927z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Email</span>
                  </motion.button>
                   
                  <motion.button 
                    onClick={() => handleShareAction('copy')}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors col-span-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center mb-3 shadow-md">
                      <svg className="text-white w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Copy Link</span>
                  </motion.button>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <motion.button 
                  onClick={closeShareModal}
                  className="w-full py-3 text-center text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramHome;
