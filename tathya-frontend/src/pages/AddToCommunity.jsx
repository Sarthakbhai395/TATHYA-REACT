// src/pages/AddToCommunity.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCommunities, joinCommunity, leaveCommunity, getCommunityById } from '../services/communityService';

const AddToCommunity = () => {
  const navigate = useNavigate();

  // --- New Indian Professional Community Images ---
  const communityImages = [
    'https://www.shutterstock.com/image-photo/indian-business-team-working-together-260nw-1124257076.jpg',
    'https://www.shutterstock.com/image-photo/young-happy-laughing-creative-team-260nw-2010755408.jpg',
    'https://daijiworld.ap-south-1.linodeobjects.com/Linode/images3/EAM190824_1.jpg',
    'http://www.track2realty.track2media.com/wp-content/uploads/2015/03/Young-Professionals.jpg',
    'https://18ff4cd87bdd9551fe74eded2489bc0f.cdn.bubble.io/cdn-cgi/image/w=512,h=318,f=auto,dpr=2.5,fit=contain/f1713162111611x510237786379619300/indian-community-togetherness-technology-concept-2023-11-27-05-03-43-utc%201.png',
    'https://www.cityairnews.com/uploads/images/image-750x-2023-01-23-08:47:05pm-63cea4f170c97.jpg',
    'https://images.pond5.com/young-professional-indian-female-mentor-footage-123110827_iconl.jpeg',
    'https://happenings.lpu.in/wp-content/uploads/2024/04/LPU-Chancellor-Dr-Ashok-Kumar-Mittal-Ar-Atul-Singla-faculty-and-the-students-from-Alcala-University-present-at-LPU-campus-scaled.jpg',
    'https://img.freepik.com/premium-photo/indian-smart-business-people-lawyer-suit-standing-as-team-isolated-white-background-looking-camera_466689-15642.jpg',
  ];

  // --- State Management ---
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCommunityForJoin, setSelectedCommunityForJoin] = useState(null);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', region: '', description: '', tags: '' });
  const [currentView, setCurrentView] = useState('list'); // 'list', 'community'
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState(null);
  const [newPostContent, setNewPostContent] = useState({ title: '', content: '' });
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newComment, setNewComment] = useState({ postId: null, content: '', replyTo: null, type: 'comment' }); // type: 'comment' or 'reply'
  const [error, setError] = useState(null);

  // --- Simulate User Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('tathya-is-authenticated') === 'true';
  });
  const [currentUser] = useState({ id: 'currentUser123', name: 'Current User' }); // Simulate logged-in user

  // Fetch communities from backend
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCommunities();
        // Map backend communities to frontend format
        const mappedCommunities = data.communities.map((community, index) => ({
          id: community._id, // Use MongoDB ObjectId as ID
          _id: community._id,
          name: community.name,
          region: community.region,
          members: community.members ? community.members.length : 0,
          description: community.description,
          image: communityImages[index % communityImages.length],
          tags: community.tags || [],
          isJoined: community.isJoined || false,
          icon: 'fas fa-users',
          posts: [],
          moderatorId: community.moderators && community.moderators.length > 0 ? community.moderators[0] : null
        }));
        setCommunities(mappedCommunities);
        setJoinedCommunities(mappedCommunities.filter(c => c.isJoined).map(c => c.id));
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // --- Handle Join/Leave Community ---
  const handleJoinLeaveCommunity = async (community) => {
    if (!isLoggedIn) {
      alert('Please log in to join a community.');
      navigate('/login');
      return;
    }

    // If user is already a member, navigate to community dashboard instead of trying to join again
    if (joinedCommunities.includes(community.id)) {
      viewCommunityDetails(community);
      return;
    }

    setIsLoading(true);
    try {
      // Join community
      await joinCommunity(community._id);
      setJoinedCommunities(prev => [...prev, community.id]);
      setCommunities(prev =>
        prev.map(c => c.id === community.id ? { ...c, isJoined: true, members: c.members + 1 } : c)
      );
      alert(`You have successfully joined the ${community.name} community!`);
      // Automatically navigate to the community after joining
      viewCommunityDetails(community);
    } catch (error) {
      console.error('Error joining community:', error);
      // If we get a 'User is already a member' error, refresh the community list
      if (error.message && error.message.includes('User is already a member')) {
        // Refresh the communities list to get the correct membership status
        const data = await getCommunities();
        const mappedCommunities = data.communities.map((comm, index) => ({
          id: comm._id,
          _id: comm._id,
          name: comm.name,
          region: comm.region,
          members: comm.members ? comm.members.length : 0,
          description: comm.description,
          image: communityImages[index % communityImages.length],
          tags: comm.tags || [],
          isJoined: comm.isJoined || false,
          icon: 'fas fa-users',
          posts: [],
          moderatorId: comm.moderators && comm.moderators.length > 0 ? comm.moderators[0] : null
        }));
        setCommunities(mappedCommunities);
        setJoinedCommunities(mappedCommunities.filter(c => c.isJoined).map(c => c.id));
        alert('You are already a member of this community.');
        // Navigate to the community since user is already a member
        viewCommunityDetails(community);
      } else {
        alert(error.message || 'Failed to join community. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelJoinLeave = () => {
    setShowJoinModal(false);
    setSelectedCommunityForJoin(null);
  };

  // --- Handle Create Community ---
  const handleCreateCommunity = () => {
    if (!isLoggedIn) {
      alert('Please log in to create a community.');
      navigate('/login');
      return;
    }
    setShowCreateCommunityModal(true);
  };

  const confirmCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.region || !newCommunity.description) {
      alert('Please fill in all required fields.');
      return;
    }
    const tagsArray = newCommunity.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const newId = communities.length > 0 ? Math.max(...communities.map(c => c.id)) + 1 : 1;
    const newCom = {
      id: newId,
      name: newCommunity.name,
      region: newCommunity.region,
      members: 1, // Creator joins automatically
      description: newCommunity.description,
      image: communityImages[Math.floor(Math.random() * communityImages.length)], // Random image
      tags: tagsArray,
      isJoined: true,
      icon: 'fas fa-users',
      posts: [],
      moderatorId: currentUser.id // Assign creator as moderator
    };

    setCommunities(prev => [...prev, newCom]);
    setJoinedCommunities(prev => [...prev, newId]);
    alert(`Community "${newCommunity.name}" created successfully! You are now the moderator.`);
    setShowCreateCommunityModal(false);
    setNewCommunity({ name: '', region: '', description: '', tags: '' });
  };

  const cancelCreateCommunity = () => {
    setShowCreateCommunityModal(false);
    setNewCommunity({ name: '', region: '', description: '', tags: '' });
  };

  // --- View Community Details (Visit Community) ---
  const viewCommunityDetails = async (community) => {
    // If user hasn't joined according to frontend state, prompt them to join first.
    if (!joinedCommunities.includes(community.id)) {
      alert('You must join this community to view its content.');
      return;
    }
    
    // Navigate to the CommunityDashboard route with the community ID and data
    // The CommunityDashboard will verify membership on the backend
    navigate(`/community-dashboard/${community._id}`, { state: { community } });
  };

  // --- Handle Create Post ---
  const handleCreatePost = () => {
    if (!isLoggedIn) {
      alert('Please log in to create a post.');
      navigate('/login');
      return;
    }
    setShowCreatePostModal(true);
  };

  const confirmCreatePost = () => {
    if (!newPostContent.title || !newPostContent.content) {
      alert('Please fill in the title and content.');
      return;
    }
    if (selectedCommunityDetails) {
      const updatedPost = {
        id: Date.now(), // Unique ID
        title: newPostContent.title,
        content: newPostContent.content,
        author: currentUser.name,
        timestamp: 'Just now',
        likes: 0,
        likedBy: [],
        comments: []
      };

      setCommunities(prev =>
        prev.map(c =>
          c.id === selectedCommunityDetails.id
            ? { ...c, posts: [updatedPost, ...c.posts] }
            : c
        )
      );

      // Update local state for immediate UI update
      setSelectedCommunityDetails(prev => ({
        ...prev,
        posts: [updatedPost, ...prev.posts]
      }));

      alert('Post created successfully!');
      setShowCreatePostModal(false);
      setNewPostContent({ title: '', content: '' });
    }
  };

  const cancelCreatePost = () => {
    setShowCreatePostModal(false);
    setNewPostContent({ title: '', content: '' });
  };

  // --- Handle Like/Unlike Post ---
  const handleLikePost = (postId) => {
    if (!isLoggedIn) {
        alert('Please log in to like posts.');
        navigate('/login');
        return;
    }
    setCommunities(prev => prev.map(c => {
        if (c.id === selectedCommunityDetails.id) {
            const updatedPosts = c.posts.map(post => {
                if (post.id === postId) {
                    const isLiked = post.likedBy.includes(currentUser.id);
                    const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
                    const newLikedBy = isLiked 
                        ? post.likedBy.filter(id => id !== currentUser.id) 
                        : [...post.likedBy, currentUser.id];
                    return { ...post, likes: newLikes, likedBy: newLikedBy };
                }
                return post;
            });
            return { ...c, posts: updatedPosts };
        }
        return c;
    }));

    // Update local state for immediate UI update
    if (selectedCommunityDetails) {
        const updatedPosts = selectedCommunityDetails.posts.map(post => {
            if (post.id === postId) {
                const isLiked = post.likedBy.includes(currentUser.id);
                const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
                const newLikedBy = isLiked 
                    ? post.likedBy.filter(id => id !== currentUser.id) 
                    : [...post.likedBy, currentUser.id];
                return { ...post, likes: newLikes, likedBy: newLikedBy };
            }
            return post;
        });
        setSelectedCommunityDetails({ ...selectedCommunityDetails, posts: updatedPosts });
    }
  };

  // --- Handle Comment/Reply ---
  const handleOpenCommentBox = (postId, type = 'comment', replyTo = null) => {
    if (!isLoggedIn) {
        alert('Please log in to comment.');
        navigate('/login');
        return;
    }
    setNewComment({ postId, content: '', replyTo, type });
  };

  const handleCommentChange = (e) => {
    setNewComment({...newComment, content: e.target.value});
  };

  const submitComment = () => {
    if (!newComment.content.trim()) return;

    setCommunities(prev => prev.map(c => {
        if (c.id === selectedCommunityDetails.id) {
            const updatedPosts = c.posts.map(post => {
                if (post.id === newComment.postId) {
                    if (newComment.type === 'comment') {
                        // Add new comment
                        const newCommentObj = {
                            id: Date.now(),
                            content: newComment.content,
                            author: currentUser.name,
                            timestamp: 'Just now',
                            likes: 0,
                            likedBy: [],
                            replies: []
                        };
                        return { ...post, comments: [newCommentObj, ...post.comments] };
                    } else if (newComment.type === 'reply' && newComment.replyTo) {
                        // Add new reply to a comment
                        const updatedComments = post.comments.map(comment => {
                            if (comment.id === newComment.replyTo) {
                                const newReply = {
                                    id: Date.now(),
                                    content: newComment.content,
                                    author: currentUser.name,
                                    timestamp: 'Just now',
                                    likes: 0,
                                    likedBy: []
                                };
                                return { ...comment, replies: [...comment.replies, newReply] };
                            }
                            return comment;
                        });
                        return { ...post, comments: updatedComments };
                    }
                }
                return post;
            });
            return { ...c, posts: updatedPosts };
        }
        return c;
    }));

    // Update local state for immediate UI update
    if (selectedCommunityDetails) {
        const updatedPosts = selectedCommunityDetails.posts.map(post => {
            if (post.id === newComment.postId) {
                if (newComment.type === 'comment') {
                    const newCommentObj = {
                        id: Date.now(),
                        content: newComment.content,
                        author: currentUser.name,
                        timestamp: 'Just now',
                        likes: 0,
                        likedBy: [],
                        replies: []
                    };
                    return { ...post, comments: [newCommentObj, ...post.comments] };
                } else if (newComment.type === 'reply' && newComment.replyTo) {
                    const updatedComments = post.comments.map(comment => {
                        if (comment.id === newComment.replyTo) {
                            const newReply = {
                                id: Date.now(),
                                content: newComment.content,
                                author: currentUser.name,
                                timestamp: 'Just now',
                                likes: 0,
                                likedBy: []
                            };
                            return { ...comment, replies: [...comment.replies, newReply] };
                        }
                        return comment;
                    });
                    return { ...post, comments: updatedComments };
                }
            }
            return post;
        });
        setSelectedCommunityDetails({ ...selectedCommunityDetails, posts: updatedPosts });
    }

    setNewComment({ postId: null, content: '', replyTo: null, type: 'comment' });
  };

  // --- Handle Like/Unlike Comment/Reply ---
  const handleLikeComment = (postId, commentId, replyId = null) => {
    if (!isLoggedIn) {
        alert('Please log in to like comments.');
        navigate('/login');
        return;
    }
    setCommunities(prev => prev.map(c => {
        if (c.id === selectedCommunityDetails.id) {
            const updatedPosts = c.posts.map(post => {
                if (post.id === postId) {
                    let updatedComments = [...post.comments];
                    if (replyId) { // It's a reply
                        updatedComments = updatedComments.map(comment => {
                            if (comment.id === commentId) {
                                const updatedReplies = comment.replies.map(reply => {
                                    if (reply.id === replyId) {
                                        const isLiked = reply.likedBy.includes(currentUser.id);
                                        const newLikes = isLiked ? reply.likes - 1 : reply.likes + 1;
                                        const newLikedBy = isLiked 
                                            ? reply.likedBy.filter(id => id !== currentUser.id) 
                                            : [...reply.likedBy, currentUser.id];
                                        return { ...reply, likes: newLikes, likedBy: newLikedBy };
                                    }
                                    return reply;
                                });
                                return { ...comment, replies: updatedReplies };
                            }
                            return comment;
                        });
                    } else { // It's a top-level comment
                        updatedComments = updatedComments.map(comment => {
                            if (comment.id === commentId) {
                                const isLiked = comment.likedBy.includes(currentUser.id);
                                const newLikes = isLiked ? comment.likes - 1 : comment.likes + 1;
                                const newLikedBy = isLiked 
                                    ? comment.likedBy.filter(id => id !== currentUser.id) 
                                    : [...comment.likedBy, currentUser.id];
                                return { ...comment, likes: newLikes, likedBy: newLikedBy };
                            }
                            return comment;
                        });
                    }
                    return { ...post, comments: updatedComments };
                }
                return post;
            });
            return { ...c, posts: updatedPosts };
        }
        return c;
    }));

    // Update local state for immediate UI update
    if (selectedCommunityDetails) {
        const updatedPosts = selectedCommunityDetails.posts.map(post => {
            if (post.id === postId) {
                let updatedComments = [...post.comments];
                if (replyId) {
                    updatedComments = updatedComments.map(comment => {
                        if (comment.id === commentId) {
                            const updatedReplies = comment.replies.map(reply => {
                                if (reply.id === replyId) {
                                    const isLiked = reply.likedBy.includes(currentUser.id);
                                    const newLikes = isLiked ? reply.likes - 1 : reply.likes + 1;
                                    const newLikedBy = isLiked 
                                        ? reply.likedBy.filter(id => id !== currentUser.id) 
                                        : [...reply.likedBy, currentUser.id];
                                    return { ...reply, likes: newLikes, likedBy: newLikedBy };
                                }
                                return reply;
                            });
                            return { ...comment, replies: updatedReplies };
                        }
                        return comment;
                    });
                } else {
                    updatedComments = updatedComments.map(comment => {
                        if (comment.id === commentId) {
                            const isLiked = comment.likedBy.includes(currentUser.id);
                            const newLikes = isLiked ? comment.likes - 1 : comment.likes + 1;
                            const newLikedBy = isLiked 
                                ? comment.likedBy.filter(id => id !== currentUser.id) 
                                : [...comment.likedBy, currentUser.id];
                            return { ...comment, likes: newLikes, likedBy: newLikedBy };
                        }
                        return comment;
                    });
                }
                return { ...post, comments: updatedComments };
            }
            return post;
        });
        setSelectedCommunityDetails({ ...selectedCommunityDetails, posts: updatedPosts });
    }
  };

  // --- Handle Leave Community from Dashboard ---
  const handleLeaveCommunityFromDashboard = () => {
    if (!isLoggedIn) {
        alert('Please log in to leave a community.');
        navigate('/login');
        return;
    }
    if (!selectedCommunityDetails) return;

    // Show confirmation modal
    setSelectedCommunityForJoin(selectedCommunityDetails);
    setShowJoinModal(true); // Reuse modal for confirmation
  };

  // --- Filter Communities based on Search and Region ---
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesRegion = selectedRegion === 'All' || community.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // --- Get unique regions for filter dropdown ---
  const uniqueRegions = ['All', ...new Set(communities.map(c => c.region))];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  if (currentView === 'community' && selectedCommunityDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <button
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition-colors duration-300 group"
          >
            <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Back to Communities
          </button>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <img
              src={selectedCommunityDetails.image}
              alt={selectedCommunityDetails.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl font-bold">{selectedCommunityDetails.name}</h1>
              <p className="text-indigo-200">{selectedCommunityDetails.region} • {selectedCommunityDetails.members} members</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-700 mb-4">{selectedCommunityDetails.description}</p>
                <div className="community-tags flex flex-wrap gap-2 mb-4">
                  {selectedCommunityDetails.tags.map((tag, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Moderator: {currentUser.id === selectedCommunityDetails.moderatorId ? 'You' : 'Assigned'}</p>
                <button
                  onClick={handleCreatePost}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mr-2"
                >
                  <i className="fas fa-plus mr-2"></i> New Post
                </button>
                <button
                  onClick={handleLeaveCommunityFromDashboard}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Leave Community
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Discussions</h2>
              {selectedCommunityDetails.posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No posts yet. Be the first to start a discussion!</p>
              ) : (
                <div className="space-y-6">
                  {selectedCommunityDetails.posts.map(post => (
                    <motion.div
                      key={post.id}
                      className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
                        <span className="text-xs text-gray-500">{post.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-gray-600">By {post.author}</p>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center ${post.likedBy.includes(currentUser.id) ? 'text-red-500' : 'text-gray-500 hover:text-indigo-600'}`}
                          >
                            <i className={`fas fa-heart mr-1 ${post.likedBy.includes(currentUser.id) ? 'fill-current' : ''}`}></i> {post.likes > 0 ? post.likes : ''}
                          </button>
                          <button 
                            onClick={() => handleOpenCommentBox(post.id, 'comment')}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            <i className="fas fa-comment"></i> Comment
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="mb-4">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-800">{comment.author}</p>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <button 
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className={`text-xs ${comment.likedBy.includes(currentUser.id) ? 'text-red-500' : 'text-gray-500 hover:text-indigo-600'}`}
                              >
                                <i className={`fas fa-heart mr-1 ${comment.likedBy.includes(currentUser.id) ? 'fill-current' : ''}`}></i> {comment.likes > 0 ? comment.likes : ''}
                              </button>
                              <button 
                                onClick={() => handleOpenCommentBox(post.id, 'reply', comment.id)}
                                className="text-xs text-gray-500 hover:text-indigo-600"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Replies Section */}
                            {comment.replies && comment.replies.map(reply => (
                              <div key={reply.id} className="mt-3 ml-4 pl-4 border-l-2 border-gray-100">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium text-gray-800">{reply.author}</p>
                                  <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                </div>
                                <p className="text-gray-700">{reply.content}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <button 
                                    onClick={() => handleLikeComment(post.id, comment.id, reply.id)}
                                    className={`text-xs ${reply.likedBy.includes(currentUser.id) ? 'text-red-500' : 'text-gray-500 hover:text-indigo-600'}`}
                                  >
                                    <i className={`fas fa-heart mr-1 ${reply.likedBy.includes(currentUser.id) ? 'fill-current' : ''}`}></i> {reply.likes > 0 ? reply.likes : ''}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Comment Input Box */}
                      {newComment.postId === post.id && newComment.type === 'comment' && (
                        <div className="mt-4 flex">
                          <input
                            type="text"
                            value={newComment.content}
                            onChange={handleCommentChange}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={submitComment}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                          >
                            Post
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreatePostModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Post in {selectedCommunityDetails?.name}</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newPostContent.title}
                      onChange={(e) => setNewPostContent({...newPostContent, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter post title..."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={newPostContent.content}
                      onChange={(e) => setNewPostContent({...newPostContent, content: e.target.value})}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Write your post content..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cancelCreatePost}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmCreatePost}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Post'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <Link
          to="/"
          className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition-colors duration-300 group"
        >
          <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Back to Home
        </Link>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
            <h3 className="text-lg font-medium text-red-800">Error Loading Communities</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <motion.header
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-16"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        >
          Join the <span className="text-indigo-600">TATHYA</span> Community
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Connect with peers across India, share your journey, and build a supportive network that empowers every student.
        </motion.p>
      </motion.header>

      {/* Search and Filter Bar */}
      <motion.div
        className="max-w-5xl mx-auto mb-16 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex-1">
            <label htmlFor="community-search" className="block text-sm font-medium text-gray-800 mb-2">
              Search Communities
            </label>
            <div className="relative">
              <input
                id="community-search"
                type="text"
                placeholder="Search by name, topic, or region..."
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-500 text-lg"></i>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label htmlFor="community-region" className="block text-sm font-medium text-gray-800 mb-2">
              Filter by Region
            </label>
            <select
              id="community-region"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleCreateCommunity}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i> Create New Community
          </button>
        </div>
      </motion.div>

      {/* Communities Grid */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {filteredCommunities.length === 0 ? (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <i className="fas fa-users-slash text-6xl text-gray-400 mb-6"></i>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Communities Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try different keywords or explore all regions to discover your perfect community.
            </p>
            <button
              onClick={handleCreateCommunity}
              className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-plus mr-2"></i> Create Your Own Community
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                className="community-card bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl flex flex-col h-full border border-gray-100"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="community-image h-48 overflow-hidden relative">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.target.src = communityImages[0]; // fallback
                    }}
                  />
                  <div className="community-badge absolute top-4 left-4 bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center z-10">
                    <i className={`${community.icon} mr-1.5 text-xs`}></i> {community.region}
                  </div>
                </div>
                <div className="community-content p-6 flex-1 flex flex-col">
                  <div className="community-header mb-4">
                    <h3 className="community-title text-xl font-bold mb-2 text-gray-900">
                      <button onClick={() => viewCommunityDetails(community)} className="hover:text-indigo-600 transition-colors">
                        {community.name}
                      </button>
                    </h3>
                    <p className="community-description text-gray-600 mb-4 text-sm leading-relaxed">
                      {community.description}
                    </p>
                  </div>
                  <div className="community-meta flex justify-between items-center text-gray-500 text-xs mb-4">
                    <span><i className="fas fa-users mr-1.5"></i> {community.members.toLocaleString()} Members</span>
                    <span><i className="fas fa-map-marker-alt mr-1.5"></i> {community.region}</span>
                  </div>
                  <div className="community-tags flex flex-wrap gap-2 mb-5">
                    {community.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                    {community.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md">
                        +{community.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="community-actions mt-auto">
                    <button
                      onClick={() => handleJoinLeaveCommunity(community)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                        joinedCommunities.includes(community.id)
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                        </>
                      ) : joinedCommunities.includes(community.id) ? (
                        <>
                          <i className="fas fa-eye mr-2"></i> Visit Community
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus mr-2"></i> Join Community
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.main>

      {/* Enhanced Call to Action Section */}
      <motion.section
        className="cta-section py-20 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white rounded-3xl shadow-2xl overflow-hidden relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Empower Yourself and Others
            </motion.h2>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            ></motion.div>
            <motion.p
              className="text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              TATHYA is more than just a platform — it’s a movement. Join thousands of students building a safer, more supportive academic ecosystem across India.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: 'fa-users',
                title: 'Join a Community',
                description: 'Find your tribe. Connect with students facing similar challenges in your region or area of interest.',
                link: '/add-to-community',
                linkText: 'Explore Communities',
              },
              {
                icon: 'fa-lightbulb',
                title: 'Share Your Story',
                description: 'Inspire others. Your journey of overcoming challenges can motivate and guide fellow students.',
                link: '/success-stories',
                linkText: 'Share Experience',
              },
              {
                icon: 'fa-hands-helping',
                title: 'Become a Mentor',
                description: 'Give back. Once you’ve found your footing, help newer students navigate their own paths.',
                link: '/mentor-program',
                linkText: 'Apply to Mentor',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="cta-card bg-white/10 backdrop-blur-sm p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, background: 'rgba(255,255,255,0.15)' }}
              >
                <div className="cta-icon w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className={`fas ${item.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="cta-title text-2xl font-bold mb-4 text-center">{item.title}</h3>
                <p className="cta-description text-gray-200 mb-6 flex-1 text-center leading-relaxed">{item.description}</p>
                <Link
                  to={item.link}
                  className="cta-link inline-flex items-center justify-center text-white font-semibold mt-auto transition-all duration-300 hover:text-yellow-200 group"
                >
                  {item.linkText} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.p
              className="text-lg mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              Ready to make a difference? Start by joining a community today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            >
              <Link
                to="/add-to-community"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-800 font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-100 group"
              >
                <i className="fas fa-users mr-2"></i> Join a Community Now
                <i className="fas fa-arrow-right ml-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Join/Leave Confirmation Modal */}
      <AnimatePresence>
        {showJoinModal && selectedCommunityForJoin && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelJoinLeave}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <i className={`fas ${joinedCommunities.includes(selectedCommunityForJoin.id) ? 'fa-sign-out-alt' : 'fa-users'} text-indigo-600 text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {joinedCommunities.includes(selectedCommunityForJoin.id) ? 'Confirm Leave Community' : 'Confirm Join Community'}
                </h3>
                <p className="text-gray-600 mb-6 px-2">
                  Are you sure you want to {joinedCommunities.includes(selectedCommunityForJoin.id) ? 'leave' : 'join'} the <strong className="text-indigo-700">{selectedCommunityForJoin.name}</strong> community?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelJoinLeave}
                    className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleJoinLeaveCommunity(selectedCommunityForJoin)}
                    disabled={isLoading}
                    className={`px-6 py-2.5 ${
                        joinedCommunities.includes(selectedCommunityForJoin.id) 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white font-medium rounded-lg transition-all shadow-md`}
                  >
                    {isLoading ? 'Processing...' : (joinedCommunities.includes(selectedCommunityForJoin.id) ? 'Leave Community' : 'Join Community')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreateCommunityModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelCreateCommunity}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <i className="fas fa-plus text-indigo-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Create New Community</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                  <input
                    type="text"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter community name..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={newCommunity.region}
                    onChange={(e) => setNewCommunity({...newCommunity, region: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Region</option>
                    {uniqueRegions.filter(r => r !== 'All').map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your community..."
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newCommunity.tags}
                    onChange={(e) => setNewCommunity({...newCommunity, tags: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Tech, Career, Support"
                  />
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelCreateCommunity}
                    className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCreateCommunity}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                  >
                    {isLoading ? 'Creating...' : 'Create Community'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddToCommunity;