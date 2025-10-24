// src/pages/CommunityDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCommunityById, joinCommunity, leaveCommunity } from '../services/communityService';
import { motion, AnimatePresence } from 'framer-motion';
import postService from '../services/postService';
import { API_BASE } from '../utils/api';
import { getAuthUser } from '../services/authService';

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const { communityId } = useParams(); // Get community ID from URL params
  const location = useLocation();
  const fileInputImageRef = useRef(null);
  const fileInputVideoRef = useRef(null);
  const fileRef = useRef(null);

  // --- State Management ---
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getAuthUser();
  const uid = currentUser && (currentUser._id || currentUser.id || currentUser.userId || (currentUser.user && (currentUser.user._id || currentUser.user.id)));
  const [communityData, setCommunityData] = useState(null);

  useEffect(() => { 
    if (communityId) {
      load(); 
    }
  }, [communityId]);

  async function load() {
    setLoading(true);
    try {
      const community = await getCommunityById(communityId);
      
      // If user is not a member, redirect back to communities page
      if (!community.isJoined) {
        alert('You must join this community to view its content.');
        navigate('/add-to-community');
        return;
      }
      
      setCommunityData(community);
      const json = await postService.fetchPostsByCommunity(communityId);
      const normalized = (json.posts || []).map(normalizePost);
      setPosts(normalized);
    } catch (err) {
      console.error(err);
      // If it's a 404 error, the community doesn't exist
      if (err.message && err.message.includes('not found')) {
        alert('Community not found.');
      } else {
        alert('Error loading community data. Please try again.');
      }
      navigate('/add-to-community');
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (type === 'image') {
      setNewPostImages(selectedFiles);
    } else if (type === 'video') {
      setNewPostVideos(selectedFiles);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newPostContent);
      formData.append('content', newPostContent);
      formData.append('communityId', communityId);
      [...newPostImages, ...newPostVideos].forEach((file) => formData.append('attachments', file));

      await postService.createPost(formData);
      setNewPostContent('');
      setNewPostImages([]);
      setNewPostVideos([]);
      if (fileInputImageRef.current) fileInputImageRef.current.value = '';
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizePost = (post) => {
    // Separate images and videos from attachments
    const images = [];
    const videos = [];
    
    if (post.attachments && Array.isArray(post.attachments)) {
      post.attachments.forEach(attachment => {
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

    return {
      id: post._id,
      author: {
        name: post.user ? post.user.name : 'Anonymous',
        avatar: post.user && post.user.avatar ? post.user.avatar : 'https://ui-avatars.com/api/?name=User&background=random',
      },
      content: post.content,
      images: images,
      videos: videos,
      timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      likes: (post.likes || []).length,
      likedByCurrentUser: (post.likes || []).includes(uid),
      comments: (post.comments || []).map(comment => ({
        id: comment._id,
        author: {
          name: 'Anonymous', // No user info available since we removed userId
          avatar: 'https://ui-avatars.com/api/?name=User&background=random',
        },
        content: comment.content,
        timestamp: comment.timestamp ? new Date(comment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        likes: (comment.likes || []).length,
        likedByCurrentUser: (comment.likes || []).includes(uid),
        replies: (comment.replies || []).map(reply => ({
          id: reply._id,
          author: {
            name: 'Anonymous', // No user info available since we removed userId
            avatar: 'https://ui-avatars.com/api/?name=User&background=random',
          },
          content: reply.content,
          timestamp: reply.timestamp ? new Date(reply.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          likes: (reply.likes || []).length,
          likedByCurrentUser: (reply.likes || []).includes(uid),
        })),
      })),
    };
  };

  const [posts, setPosts] = useState([]);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState([]); // Array for selected image files
  const [newPostVideos, setNewPostVideos] = useState([]); // Array for selected video files
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [newComment, setNewComment] = useState({ postId: null, content: '' });
  const [newReply, setNewReply] = useState({ commentId: null, content: '' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);

  // If navigated here with location.state.community, use it to populate communityData and posts
  // But prioritize URL parameter if available
  useEffect(() => {
    if (communityId) {
      // Load community data from backend using the ID from URL
      load();
    } else if (location && location.state && location.state.community) {
      const passed = location.state.community;
      // Load fresh data from backend to ensure user is actually a member
      load();
    }
  }, [location, communityId]);

  // --- Simulate User Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('tathya-is-authenticated') === 'true';
  });

  // --- Handle Create Post Click ---
  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      alert('Please log in to create a post.');
      navigate('/login');
      return;
    }
    setShowCreatePostForm(true);
  };

  // --- Handle File Selection (Images/Videos) ---
  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    if (type === 'image') {
      // Filter only image files
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setNewPostImages(prev => [...prev, ...imageFiles]);
    } else if (type === 'video') {
      // Filter only video files
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      setNewPostVideos(prev => [...prev, ...videoFiles]);
    }
    // Clear the file input value to allow selecting the same file again
    event.target.value = '';
  };

  // --- Handle Remove Media ---
  const handleRemoveMedia = (index, type) => {
    if (type === 'image') {
      const newImages = [...newPostImages];
      const removedFile = newImages.splice(index, 1)[0];
      if (removedFile) {
        URL.revokeObjectURL(removedFile); // Free memory
      }
      setNewPostImages(newImages);
    } else if (type === 'video') {
      const newVideos = [...newPostVideos];
      const removedFile = newVideos.splice(index, 1)[0];
      if (removedFile) {
        URL.revokeObjectURL(removedFile); // Free memory
      }
      setNewPostVideos(newVideos);
    }
  };

  // --- Handle Publish Post ---
  const handlePublishPost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0 && newPostVideos.length === 0) {
      alert('Please add some content, image, or video to your post.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', newPostContent);
      formData.append('content', newPostContent);
      formData.append('communityId', communityData._id || communityData.id);
      
      // Add all files as attachments
      [...newPostImages, ...newPostVideos].forEach((file) => {
        formData.append('attachments', file);
      });

      await postService.createPost(formData);
      
      // Reset form
      setNewPostContent('');
      // Revoke object URLs to free memory
      newPostImages.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
      newPostVideos.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
      setNewPostImages([]);
      setNewPostVideos([]);
      setShowCreatePostForm(false);
      
      // Reload posts to show the new one
      load();
      
      alert('Post published successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // --- Handle Post Like ---
  const handlePostLike = async (postId) => {
    if (!isLoggedIn) {
      alert('Please log in to like posts.');
      navigate('/login');
      return;
    }
    
    try {
      await postService.likePost(postId);
      // Reload posts to reflect the like status
      load();
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  // --- Handle Add Comment ---
  const handleAddComment = async (postId) => {
    const commentText = newComment.content?.trim();
    if (!commentText) return;
    
    try {
      await postService.addComment(postId, commentText);
      // Reset comment form
      setNewComment({ postId: null, content: '' });
      // Reload posts to show the new comment
      load();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // --- Handle Add Reply ---
  const handleAddReply = async (commentId, postId) => {
    const replyText = newReply.content?.trim();
    if (!replyText) return;
    
    try {
      await postService.addComment(postId, replyText, commentId);
      // Reset reply form
      setNewReply({ commentId: null, content: '' });
      // Reload posts to show the new reply
      load();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  // --- Handle Comment/Reply Like ---
  const handleCommentLike = async (postId, commentId, replyId = null) => {
    if (!isLoggedIn) {
      alert('Please log in to like comments/replies.');
      navigate('/login');
      return;
    }
    
    try {
      await postService.likeComment(postId, commentId, replyId);
      // Reload posts to reflect the like status
      load();
    } catch (error) {
      console.error('Error liking comment/reply:', error);
      alert('Failed to like comment/reply. Please try again.');
    }
  };

  // --- Handle Share Post ---
  const handleSharePost = (postId) => {
    setSharePostId(postId);
    setShowShareModal(true);
  };

  // --- Handle Share to Platform ---
  const handleShareToPlatform = (platform) => {
    const post = posts.find(p => p.id === sharePostId);
    if (!post || !communityData) return; // Add communityData check
    const postUrl = `${window.location.origin}/community/${communityData.name.replace(/\s+/g, '-')}/post/${post.id}`; // Example URL
    const postText = post.content.substring(0, 100) + '...'; // Shortened content
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${postText} ${postUrl}`)}`;
        break;
      case 'instagram':
        // Instagram sharing usually requires the app
        alert('Instagram sharing works best on mobile devices. The Instagram app will open where you can share the link.');
        window.open("instagram://", '_blank');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'email':
        const subject = `Check out this post on TATHYA Community - ${communityData.name}!`;
        const body = `I thought you might be interested in this post: ${postUrl}\n${postText}`;
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      default:
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    setShowShareModal(false);
    setSharePostId(null);
  };

  // --- Handle Join Community ---
  const handleJoinCommunity = async () => {
    // Use communityId from URL params or from communityData
    const idToUse = communityId || (communityData && (communityData._id || communityData.id));
    if (!idToUse) return;
    
    try {
      await joinCommunity(idToUse);
      setCommunityData(prev => ({ ...prev, isJoined: true, members: (prev.members || 0) + 1 }));
      alert(`You have successfully joined the ${communityData.name} community!`);
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    }
  };

  // --- Handle Leave Community ---
  const handleLeaveCommunity = async () => {
    // Use communityId from URL params or from communityData
    const idToUse = communityId || (communityData && (communityData._id || communityData.id));
    if (!idToUse) return;
    
    const confirmed = window.confirm(`Are you sure you want to leave the ${communityData.name} community? You will lose access to its posts and features.`);
    if (confirmed) {
      try {
        await leaveCommunity(idToUse);
        setCommunityData(prev => ({ ...prev, isJoined: false, members: (prev.members || 1) - 1 }));
        alert(`You have left the ${communityData.name} community. You can rejoin anytime from the Community section.`);
        navigate('/add-to-community');
      } catch (error) {
        console.error('Error leaving community:', error);
        alert('Failed to leave community. Please try again.');
      }
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link
          to="/add-to-community"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-300"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Communities
        </Link>
      </motion.div>

      {/* Community Header */}
      {communityData && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
              <i className={`fas ${communityData.icon} text-white text-4xl`}></i>
            </div>
          </motion.div>
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {communityData.name}
          </motion.h1>
          <motion.p
            className="text-lg text-gray-700 max-w-2xl mx-auto mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {communityData.description}
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {communityData.tags.map((tag, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <span className="text-gray-700 flex items-center"><i className="fas fa-users mr-2"></i> {communityData.members.toLocaleString()} Members</span>
            <span className="text-gray-700 flex items-center"><i className="fas fa-map-marker-alt mr-2"></i> {communityData.region}</span>
          </motion.div>
          {/* Join/Leave Community Button */}
          <motion.button
            onClick={communityData.isJoined ? handleLeaveCommunity : handleJoinCommunity}
            className={`py-2.5 px-5 rounded-lg transition-colors duration-300 flex items-center justify-center mx-auto mt-4 shadow-md ${communityData.isJoined ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            {communityData.isJoined ? (
              <><i className="fas fa-sign-out-alt mr-2"></i> Leave Community</>
            ) : (
              <><i className="fas fa-user-plus mr-2"></i> Join Community</>
            )}
          </motion.button>
        </motion.header>
      )}

      {/* Main Content */}
      <main>
        {/* Create Post Section */}
        <motion.section
          className="create-post-section mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            {!showCreatePostForm ? (
              <div className="text-center">
                <button
                  onClick={handleCreatePostClick}
                  className="create-post-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center mx-auto shadow-md"
                >
                  <i className="fas fa-plus mr-3"></i> Create New Post
                </button>
              </div>
            ) : (
              <div className="create-post-form">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Create a New Post</h3>
                <div className="mb-4">
                  <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
                    What's on your mind?
                  </label>
                  <textarea
                    id="post-content"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
                    placeholder="Share your thoughts, experiences, or ask for advice..."
                  ></textarea>
                </div>
                {/* Media Upload Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Media</label>
                  <div className="flex flex-wrap gap-3">
                    {/* Image Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputImageRef}
                        onChange={(e) => handleFileSelect(e, 'image')}
                        className="hidden"
                        accept="image/*"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => fileInputImageRef.current && fileInputImageRef.current.click()}
                        className="add-image-btn bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center shadow-sm"
                      >
                        <i className="fas fa-image mr-2"></i> Add Images
                      </button>
                    </div>
                    {/* Video Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputVideoRef}
                        onChange={(e) => handleFileSelect(e, 'video')}
                        className="hidden"
                        accept="video/*"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => fileInputVideoRef.current && fileInputVideoRef.current.click()}
                        className="add-video-btn bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center shadow-sm"
                      >
                        <i className="fas fa-video mr-2"></i> Add Videos
                      </button>
                    </div>
                  </div>
                  {/* Preview Selected Media */}
                  {(newPostImages.length > 0 || newPostVideos.length > 0) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Media:</h4>
                      <div className="flex flex-wrap gap-3">
                        {/* Image Previews */}
                        {newPostImages.map((file, index) => (
                          <div key={`img-${index}`} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(index, 'image')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        {/* Video Previews (Thumbnails) */}
                        {newPostVideos.map((vidUrl, index) => (
                          <div key={`vid-${index}`} className="relative group">
                            <div className="w-32 h-32 bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                              <i className="fas fa-video text-gray-500 text-xl"></i>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(index, 'video')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePostForm(false);
                      setNewPostContent('');
                      setNewPostImages([]);
                      setNewPostVideos([]);
                    }}
                    className="cancel-post-btn px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishPost}
                    className="publish-post-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md"
                  >
                    Publish Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Community Posts Feed */}
        <motion.section
          className="community-posts-feed"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Community Feed</h3>
            <div className="posts-list space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="post bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm"
                  variants={itemVariants}
                >
                  {/* Post Header */}
                  <div className="post-header flex items-center mb-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-indigo-200"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-gray-800">{post.author.name}</h4>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  {/* Post Content */}
                  <div className="post-content mb-4">
                    <p className="text-gray-700 text-base mb-4">{post.content}</p>
                    {/* Media (Images/Videos) */}
                    {(post.images.length > 0 || post.videos.length > 0) && (
                      <div className="post-media mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {post.images.map((imgUrl, imgIndex) => (
                            <img
                              key={`post-img-${imgIndex}`}
                              src={imgUrl}
                              alt={`Post image ${imgIndex + 1}`}
                              className="w-full object-contain rounded-lg border border-gray-200 shadow-sm" // Changed to object-contain for flexible height
                              style={{ maxHeight: '400px' }} // Optional: limit max height
                            />
                          ))}
                          {post.videos.map((vidUrl, vidIndex) => (
                            <div key={`post-vid-${vidIndex}`} className="relative">
                              <div className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center aspect-video"> {/* Use aspect-video */}
                                <i className="fas fa-video text-gray-500 text-3xl"></i>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button className="play-video-btn bg-white/80 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center hover:bg-white shadow-md">
                                  <i className="fas fa-play"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Post Stats */}
                  <div className="post-stats flex justify-between text-gray-500 text-sm mb-3">
                    {post.likes > 0 && <span>{post.likes} Likes</span>}
                    <span>{post.comments.length} Comments</span>
                  </div>
                  {/* Post Actions */}
                  <div className="post-actions flex justify-around border-t border-gray-200 pt-3">
                    <button
                      className={`post-action flex items-center py-2 px-4 rounded-lg transition-colors duration-300 ${
                        post.likedByCurrentUser ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'
                      }`}
                      onClick={() => handlePostLike(post.id)}
                    >
                      <i className={`mr-2 text-lg ${post.likedByCurrentUser ? 'fas fa-heart' : 'far fa-heart'}`}></i> Like
                    </button>
                    <button
                      className="post-action flex items-center py-2 px-4 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => {
                        setNewComment({ postId: post.id, content: '' });
                        // Safely focus the comment input element
                        const commentInput = document.getElementById(`comment-input-${post.id}`);
                        if (commentInput) {
                          commentInput.focus();
                        }
                      }}
                    >
                      <i className="far fa-comment mr-2 text-lg"></i> Comment
                    </button>
                    <button
                      className="post-action flex items-center py-2 px-4 rounded-lg text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => handleSharePost(post.id)}
                    >
                      <i className="fas fa-share-alt mr-2 text-lg"></i> Share
                    </button>
                  </div>
                  {/* Comments Section */}
                  <div className="post-comments mt-4 border-t border-gray-200 pt-4">
                    {/* Existing Comments */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="comment mb-4">
                        <div className="flex items-start">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-indigo-100"
                          />
                          <div className="flex-1">
                            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                              <div className="flex justify-between items-baseline">
                                <span className="font-medium text-sm text-gray-800">{comment.author.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <button
                                className={`like-comment-btn mr-4 ${
                                  comment.likedByCurrentUser ? 'text-red-500' : 'hover:text-red-500'
                                }`}
                                onClick={() => handleCommentLike(post.id, comment.id)}
                              >
                                <i className={`mr-1 ${comment.likedByCurrentUser ? 'fas fa-heart' : 'far fa-heart'}`}></i>
                                {comment.likes > 0 ? `${comment.likes} Like` : 'Like'}
                              </button>
                              <button
                                className="reply-comment-btn text-indigo-600 hover:text-indigo-800"
                                onClick={() => {
                                  setNewReply({ commentId: comment.id, content: '' });
                                  // Safely focus the reply input element
                                  const replyInput = document.getElementById(`reply-input-${comment.id}`);
                                  if (replyInput) {
                                    replyInput.focus();
                                  }
                                }}
                              >
                                Reply
                              </button>
                            </div>
                            {/* Replies to Comment */}
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="reply ml-6 mt-3">
                                <div className="flex items-start">
                                  <img
                                    src={reply.author.avatar}
                                    alt={reply.author.name}
                                    className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                                      <div className="flex justify-between items-baseline">
                                        <span className="font-medium text-sm text-gray-800">{reply.author.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">{reply.timestamp}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                    </div>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                      <button
                                        className={`like-reply-btn mr-4 ${
                                          reply.likedByCurrentUser ? 'text-red-500' : 'hover:text-red-500'
                                        }`}
                                        onClick={() => handleCommentLike(post.id, comment.id, reply.id)}
                                      >
                                        <i className={`mr-1 ${reply.likedByCurrentUser ? 'fas fa-heart' : 'far fa-heart'}`}></i>
                                        {reply.likes > 0 ? `${reply.likes} Like` : 'Like'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Add Reply Form */}
                            {newReply.commentId === comment.id && (
                              <div className="add-reply mt-3 ml-6 flex items-start">
                                <img
                                  src="https://randomuser.me/api/portraits/men/32.jpg" // Use current user's avatar
                                  alt="Your Avatar"
                                  className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                                />
                                <div className="flex-1 flex">
                                  <input
                                    type="text"
                                    id={`reply-input-${comment.id}`}
                                    value={newReply.content}
                                    onChange={(e) => setNewReply({ commentId: comment.id, content: e.target.value })}
                                    placeholder="Write a reply..."
                                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
                                  />
                                  <button
                                    onClick={() => handleAddReply(comment.id, post.id)}
                                    className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 transition-colors duration-300 text-sm shadow-md"
                                  >
                                    Post
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add Comment Form */}
                    {newComment.postId === post.id && (
                      <div className="add-comment mt-4 flex items-start">
                        <img
                          src="https://randomuser.me/api/portraits/men/32.jpg" // Use current user's avatar
                          alt="Your Avatar"
                          className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-indigo-100"
                        />
                        <div className="flex-1 flex">
                          <input
                            type="text"
                            id={`comment-input-${post.id}`}
                            value={newComment.content}
                            onChange={(e) => setNewComment({ postId: post.id, content: e.target.value })}
                            placeholder="Write a comment..."
                            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 transition-colors duration-300 text-sm shadow-md"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="share-modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)} // Close on backdrop click
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -50 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Share Post</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { platform: 'facebook', icon: 'fab fa-facebook-f', color: 'text-blue-600' },
                  { platform: 'twitter', icon: 'fab fa-twitter', color: 'text-blue-400' },
                  { platform: 'whatsapp', icon: 'fab fa-whatsapp', color: 'text-green-500' },
                  { platform: 'instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
                  { platform: 'linkedin', icon: 'fab fa-linkedin-in', color: 'text-blue-700' },
                  { platform: 'email', icon: 'fas fa-envelope', color: 'text-gray-700' },
                ].map((social) => (
                  <button
                    key={social.platform}
                    className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-sm"
                    onClick={() => handleShareToPlatform(social.platform)}
                  >
                    <i className={`${social.icon} ${social.color} text-2xl mb-1`}></i>
                    <span className="text-sm text-gray-700 capitalize">{social.platform}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityDashboard;