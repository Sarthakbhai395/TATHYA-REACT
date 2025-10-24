import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCommunityById, getCommunities, joinCommunity, leaveCommunity } from '../services/communityService';
import postService from '../services/postService';
// import { useAuth } from '../contexts/AuthContext';
import { getAuthUser } from '../services/authService';
import { API_BASE } from '../utils/api';

const CommunityHub = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  // State for managing communities and selected community
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User authentication state
  const currentUser = getAuthUser();
  const uid = currentUser && (currentUser|| currentUser || currentUser.user || (currentUser.user && (currentUser.user || currentUser.user)));
  const isLoggedIn = localStorage.getItem('tathya-is-authenticated') === 'true';

  useEffect(() => {
    const fetchCommunity = async () => {
      if (communityId) {
        if (!isValidObjectId(communityId)) {
          setError('Invalid community ID format');
          setLoading(false);
          return;
        }
        fetchCommunityDetails(communityId);
      } else {
        fetchAllCommunities();
      }
    };
    fetchCommunity();
  }, [communityId]);

  const fetchAllCommunities = async () => {
    setLoading(true);
    try {
      const data = await getCommunities();
      setCommunities(data.communities);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching all communities:", err);
      setError("Failed to load communities.");
      setLoading(false);
    }
  };

  const fetchCommunityDetails = async (id) => {
    setLoading(true);
    try {
      const community = await getCommunityById(id);
      setSelectedCommunity(community);
      // Also fetch posts for the community
      const json = await postService.fetchPostsByCommunity(id);
      const normalizedPosts = (json.posts || []).map(normalizePost);
      setSelectedCommunity(prev => ({ ...prev, posts: normalizedPosts }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching community details:", err);
      setError("Failed to load community details.");
      setLoading(false);
    }
  };

  const normalizePost = (post) => {
    return {
      id: post._id,
      author: {
        name: post.user ? post.user.name : '',
        avatar: post.user ? post.user.avatar : 'https://via.placeholder.com/150',
      },
      content: post.content,
      images: post.images.map(img => `${API_BASE}/${img}`),
      videos: post.videos.map(vid => `${API_BASE}/${vid}`),
      timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      likes: post.likes.length,
      likedByCurrentUser: post.likes.includes(uid),
      comments: post.comments.map(comment => ({
        id: comment._id,
        author: {
          name: comment.user ? comment.user.name : '',
          avatar: comment.user ? comment.user.avatar : 'https://via.placeholder.com/150',
        },
        content: comment.content,
        timestamp: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        likes: comment.likes.length,
        likedByCurrentUser: comment.likes.includes(uid),
        replies: comment.replies.map(reply => ({
          id: reply._id,
          author: {
            name: reply.user ? reply.user.name : '',
            avatar: reply.user ? reply.user.avatar : 'https://via.placeholder.com/150',
          },
          content: reply.content,
          timestamp: reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          likes: reply.likes.length,
          likedByCurrentUser: reply.likes.includes(uid),
        })),
      })),
    };
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  const handleJoinCommunity = async (communityId) => {
    try {
      await joinCommunity(communityId);
      setCommunities(prev => prev.map(comm => comm._id === communityId ? { ...comm, isJoined: true } : comm));
      alert('Joined community successfully!');
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community.');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await leaveCommunity(communityId);
      setCommunities(prev => prev.map(comm => comm._id === communityId ? { ...comm, isJoined: false } : comm));
      alert('Left community successfully!');
    } catch (error) {
      console.error('Error leaving community:', error);
      alert('Failed to leave community.');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    // Placeholder for actual community creation logic
    alert('Create community functionality coming soon!');
    setNewCommunityName('');
    setNewCommunityDescription('');
  };

  const CommunityList = () => (
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <h2 className="text-2xl font-bold mb-4">All Communities</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search communities..."
          className="p-2 border rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <form onSubmit={handleCreateCommunity} className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
        <h3 className="text-xl font-semibold mb-3">Create New Community</h3>
        <input
          type="text"
          placeholder="Community Name"
          className="p-2 border rounded w-full mb-2"
          value={newCommunityName}
          onChange={(e) => setNewCommunityName(e.target.value)}
          required
        />
        <textarea
          placeholder="Community Description"
          className="p-2 border rounded w-full mb-2"
          rows="3"
          value={newCommunityDescription}
          onChange={(e) => setNewCommunityDescription(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Create Community
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommunities.map(community => (
          <motion.div
            key={community._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <button
              onClick={() => navigate(`/community/${community._id}`)}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
            >
              View Community
            </button>
            {community.isJoined ? (
              <button
                onClick={() => handleLeaveCommunity(community._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => handleJoinCommunity(community._id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Join
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Community Hub</h1>
        {communityId && (
          <button
            onClick={() => navigate('/community')}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to Communities
          </button>
        )}
      </header>
      <main className="container mx-auto mt-4">
         {error && (
           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
             {error}
           </div>
         )}
         {loading ? (
           <div className="text-center text-xl">Loading communities...</div>
        ) : error ? (
          <div className="text-center text-xl text-red-500">Error: {error}</div>
        ) : communityId ? (
          <div>
            {/* Detailed Community View (to be implemented) */}
            <h2 className="text-2xl font-bold mb-4">{selectedCommunity?.name}</h2>
            <p>{selectedCommunity?.description}</p>
          </div>
        ) : (
          <CommunityList />
        )}
      </main>
    </div>
  );
};

export default CommunityHub;

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);