import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import postService from '../services/postService';
import { API_BASE } from '../utils/api';
import { getAuthUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Background Animation Component
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated Bubbles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/10 border border-blue-400/20"
          style={{
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Animated Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gray-400/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -200, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80"></div>
    </div>
  );
};

// Simple Home feed component — loads recent posts from backend and allows creating posts with attachments
const Home = () => {
  const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [files, setFiles] = useState([]);
   const fileRef = useRef(null);
   const [commentBox, setCommentBox] = useState({ postId: null, replyTo: null, replyToUser: null });
   const [commentText, setCommentText] = useState('');
   const navigate = useNavigate();
   const currentUser = getAuthUser();
   const uid = currentUser && (currentUser._id || currentUser.id || currentUser.userId || (currentUser.user && (currentUser.user._id || currentUser.user.id)));

useEffect(() => { load(); }, []);

async function load() {
  try {
    setLoading(true);
    const json = await postService.fetchRecentPosts();
    const normalized = (json.posts || []).map(normalizePost);
    setPosts(normalized);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

const handleFileChange = (e) => setFiles(Array.from(e.target.files || []));

const handleCreate = async () => {
  if (!title.trim() && !content.trim()) return alert('Add title or content');
  try {
    const created = await postService.createPost({ title, content, files });
    const createdNormalized = normalizePost(created);
    setPosts(prev => [createdNormalized, ...prev]);
    setTitle(''); setContent(''); setFiles([]); if (fileRef.current) fileRef.current.value = '';
  } catch (err) {
    console.error(err);
    alert('Could not create post');
  }
};

const handleLike = async (postId) => {
  if (!uid) {
    alert('Please login to like posts');
    navigate('/login');
    return;
  }

  try {
    // console.log('Liking post with ID:', postId, 'by user ID:', uid);
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const currentLikedBy = (p.likedBy || []).map(x => (x && x.toString ? x.toString() : x));
      const isLiked = currentLikedBy.includes(uid);
      const updatedLikedBy = isLiked
        ? currentLikedBy.filter(x => x !== uid)
        : [...currentLikedBy, uid];

      return {
        ...p,
        likes: updatedLikedBy.length,
        likedBy: updatedLikedBy
      };
    }));
    const response = await postService.likePost(postId);
    // console.log('Like post response:', response);
    // await load(); // Removed this line
  } catch (err) {
    console.error('Error liking post:', err);
    await load(); // Keep load() here to revert on error
  }
};

const handleDelete = async (postId) => {
  if (!confirm('Delete this post permanently?')) return;
  if (!uid) {
    alert('Please login to delete posts');
    navigate('/login');
    return;
  }
  try {
    await postService.deletePost(postId);
    setPosts(prev => prev.filter(p => p._id !== postId));
  } catch (err) {
    console.error(err);
    alert('Failed to delete post');
  }
};

const openCommentBox = (postId, replyTo = null, replyToUser = null) => {
  if (!uid) { alert('Please login to comment'); navigate('/login'); return; }
  setCommentBox({ postId, replyTo, replyToUser });
  setCommentText(replyToUser ? `@${replyToUser} ` : '');
};

const submitComment = async () => {
  if (!commentText.trim()) return;
  try {
    const res = await postService.addComment(commentBox.postId, commentText.trim(), commentBox.replyTo);
    // Optimistic: reload posts
    await load();
    setCommentBox({ postId: null, replyTo: null, replyToUser: null });
    setCommentText('');
  } catch (err) {
    console.error(err);
    alert('Failed to add comment');
  }
};

const handleLikeCommentLocal = async (postId, commentId, replyId = null) => {
  if (!uid) {
    alert('Please login to like comments');
    navigate('/login');
    return;
  }

  setPosts(prevPosts => prevPosts.map(post => {
    if (post._id !== postId) return post;

    const updatedComments = post.comments.map(comment => {
      if (comment._id !== commentId) return comment;

      if (replyId) {
        // Handle reply like
        const updatedReplies = comment.replies.map(reply => {
          if (reply._id !== replyId) return reply;

          const currentLikedBy = (reply.likedBy || []).map(x => (x && x.toString ? x.toString() : x));
          const isLiked = currentLikedBy.includes(uid);
          const updatedLikedBy = isLiked
            ? currentLikedBy.filter(x => x !== uid)
            : [...currentLikedBy, uid];

          return {
            ...reply,
            likes: updatedLikedBy.length,
            likedBy: updatedLikedBy
          };
        });
        return { ...comment, replies: updatedReplies };
      } else {
        // Handle comment like
        const currentLikedBy = (comment.likedBy || []).map(x => (x && x.toString ? x.toString() : x));
        const isLiked = currentLikedBy.includes(uid);
        const updatedLikedBy = isLiked
          ? currentLikedBy.filter(x => x !== uid)
          : [...currentLikedBy, uid];

        return {
          ...comment,
          likes: updatedLikedBy.length,
          likedBy: updatedLikedBy
        };
      }
    });
    return { ...post, comments: updatedComments };
  }));

  try {
    await postService.likeComment(postId, commentId, replyId);
    // No need to load() here if optimistic update is sufficient
  } catch (err) {
    console.error(err);
    alert('Failed to like comment');
    // Revert optimistic update on error if necessary, or just load()
    await load(); // Reload to ensure consistency on error
  }
};

// Pin comment function
const handlePinComment = async (postId, commentId) => {
  if (!uid) {
    alert('Please login to pin comments');
    navigate('/login');
    return;
  }
  try {
    await postService.pinComment(postId, commentId);
    await load(); // Reload to get updated pinned status
  } catch (err) {
    console.error(err);
    alert('Failed to pin comment');
  }
};

// normalize various id shapes to string
const normId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val._id) return val._id;
  if (val.id) return val.id;
  return String(val);
};

const [shareModal, setShareModal] = useState({ open: false, post: null });

// Ensure posts have consistent shape for rendering
function normalizePost(p) {
  if (!p || typeof p !== 'object') return p;
  return {
    ...p,
    likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
    likes: Array.isArray(p.likedBy) ? p.likedBy.length : (typeof p.likes === 'number' ? p.likes : 0),
    comments: Array.isArray(p.comments) ? p.comments : [],
    attachments: Array.isArray(p.attachments) ? p.attachments : [],
  };
}

const openShareModal = (post) => setShareModal({ open: true, post });
const closeShareModal = () => setShareModal({ open: false, post: null });

const handleShareAction = (platform) => {
  const post = shareModal.post;
  if (!post) return;
  const pageUrl = window.location.origin + `/#/posts/${post._id}`;
  const text = encodeURIComponent(`${post.title || ''} - ${post.content || ''}`);
  const url = encodeURIComponent(pageUrl);
  let shareUrl = '';
  if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%0A${url}`;
  if (platform === 'facebook') shareUrl = `    https://www.facebook.com/sharer/sharer.php?u=${url}`;
  if (platform === 'linkedin') shareUrl = `    https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  if (platform === 'twitter') shareUrl = `    https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  if (platform === 'email') shareUrl = `mailto:?subject=${encodeURIComponent(post.title||'')}&body=${text}%0A${pageUrl}`;
  if (shareUrl) window.open(shareUrl, '_blank');
  closeShareModal();
};

// Function to render comments recursively (for replies)
const renderComments = (comments, postId) => {
  if (!comments || !Array.isArray(comments)) return null;

  // Sort comments: pinned first, then by creation date
  const sortedComments = [...comments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return sortedComments.map((comment) => {
      const isCurrentUserComment = normId(comment.user?._id) === uid;
      const userLikedThisComment = comment.likedBy?.map(x => normId(x)).includes(uid);

      return (
        <div key={comment._id} className={`mb-4 p-3 rounded-lg ${comment.pinned ? 'bg-gray-700 border-l-4 border-yellow-500' : 'bg-gray-750'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <i className="fas fa-user-circle text-2xl text-gray-500"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-300">{comment.user?.name || ''}</p>
                {comment.pinned && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Pinned</span>}
              </div>
              <p className="text-gray-400 text-sm mt-1">{comment.content}</p>
              
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{comment.createdAt && !isNaN(new Date(comment.createdAt)) ? new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                <button onClick={() => openCommentBox(postId, comment._id, comment.user?.name)} className="hover:text-blue-400">Reply</button>
                
                <button
                  onClick={() => handleLikeCommentLocal(postId, comment._id)} 
                  className={`flex items-center gap-1 ${userLikedThisComment ? 'text-red-500' : 'hover:text-red-400'}`}
                >
                  <i className={`far fa-heart ${userLikedThisComment ? 'fas text-red-500' : ''}`}></i> {comment.likes || 0}
                </button>
                
                {isCurrentUserComment && (
                  <button
                    onClick={() => handlePinComment(postId, comment._id)}
                    className="hover:text-yellow-400"
                  >
                    {comment.pinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
              </div>

              {/* Conditional Reply Input for this comment */}
              <AnimatePresence>
                {commentBox.postId === postId && commentBox.replyTo === comment._id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex gap-2">
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder={`Replying to ${commentBox.replyToUser || 'this comment'}...`}
                      className="flex-1 p-2 border border-gray-600 bg-gray-800 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={submitComment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Post Reply</button>
                    <button onClick={() => setCommentBox({ postId: null, replyTo: null, replyToUser: null })} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-6 border-l-2 border-gray-600">
                  {comment.replies.map((reply) => {
                    const isCurrentUserReply = normId(reply.user?._id) === uid;
                    const userLikedThisReply = reply.likedBy?.map(x => normId(x)).includes(uid);

                    return (
                      <div key={reply._id} className="mb-3 p-3 rounded-lg bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <i className="fas fa-user-circle text-2xl text-gray-500"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-300">{reply.user?.name || ''}</p>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{reply.content}</p>
                            
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>{reply.createdAt && !isNaN(new Date(reply.createdAt)) ? new Date(reply.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              
                              <button
                                onClick={() => handleLikeCommentLocal(postId, comment._id, reply._id)}
                                className={`flex items-center gap-1 ${userLikedThisReply ? 'text-red-500' : 'hover:text-red-400'}`}
                              >
                                <i className={`far fa-heart ${userLikedThisReply ? 'fas text-red-500' : ''}`}></i> {reply.likes || 0}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      <BackgroundAnimation />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Share Your Thoughts</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border border-gray-700 bg-gray-700/80 rounded mb-3" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" className="w-full p-2 border border-gray-700 bg-gray-700/80 rounded mb-4 h-32 resize-none" />
          <div className="flex items-center gap-2 mb-2">
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Choose File
            </label>
            {files.length > 0 && <span className="text-gray-400 text-sm">{files.length} file(s) selected</span>}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Publish Post</button>
            <button onClick={() => { setTitle(''); setContent(''); setFiles([]); if (fileRef.current) fileRef.current.value = ''; }} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700">Clear All</button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Tathya Posts</h2>
          {loading ? <p className="text-gray-400">Loading...</p> : posts.length === 0 ? <p className="text-gray-400">No posts yet</p> : (
            posts.map(p => (
              <article key={p._id} className="mb-8 bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-bold text-lg">{p.title}</div>
                    <div className="text-sm text-gray-400">Posted on {p.createdAt && !isNaN(new Date(p.createdAt)) ? new Date(p.createdAt).toLocaleString() : 'Unknown Date'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                    <button onClick={() => openShareModal(p)} className="text-blue-500 hover:text-blue-400 text-sm">Share</button>
                  </div>
                </div>

                <div className="mt-3 mb-4 text-gray-300">{p.content}</div>
                {p.attachments && p.attachments.map((a, i) => {
                  const apiRoot = API_BASE.replace(/\/api$/i, '').replace(/\$/, '');
                  const src = a.path && (a.path.startsWith('http') ? a.path : `${apiRoot}${a.path}`);
                  return (
                    <div key={i} className="mt-4">
                      {a.mimetype && a.mimetype.startsWith('image/') ? (
                        <img src={src} className="max-h-96 w-full object-contain" alt="attachment" />
                      ) : null}
                      {a.mimetype && a.mimetype.startsWith('video/') ? (
                        <video controls autoPlay loop muted className="w-full max-h-96 object-contain"><source src={src} /></video>
                      ) : null}
                    </div>
                  );
                })}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleLike(p._id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400">
                      <i className={`${(p.likedBy || []).map(x => (x && x.toString ? x.toString() : x)).includes(uid) ? 'text-blue-500 fas' : 'far'} fa-heart`}></i>
                      {p.likes || 0}
                    </button>
                    <button onClick={() => openCommentBox(p._id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400"><i className="far fa-comment"></i> Comment</button>
                  </div>
                  <div className="text-sm text-gray-400">{p.comments?.length || 0} comments</div>
                </div>

                {p.comments && p.comments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-300 mb-2">Comments</h4>
                    {renderComments(p.comments, p._id)}
                  </div>
                )}

                {/* Comment input */}
                <AnimatePresence>
                  {commentBox.postId === p._id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex gap-2">
                      <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={commentBox.replyTo ? `Replying to ${commentBox.replyToUser}...` : 'Write a comment...'} className="flex-1 p-2 border border-gray-700 bg-gray-700/80 rounded" />
                      <button onClick={submitComment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Post</button>
                      <button onClick={() => setCommentBox({ postId: null, replyTo: null, replyToUser: null })} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700">Cancel</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Share modal */}
      {shareModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={closeShareModal} />
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 z-50 w-full max-w-md">
            <h4 className="text-xl font-bold mb-4">Share Post</h4>
            <p className="text-gray-300 mb-6">Spread the word! Share this post with your friends and followers.</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button onClick={() => handleShareAction('whatsapp')} className="p-4 bg-green-500 text-white rounded-lg flex flex-col items-center">
                <i className="fab fa-whatsapp text-2xl mb-1"></i>
                <span className="text-sm">WhatsApp</span>
              </button>
              <button onClick={() => handleShareAction('facebook')} className="p-4 bg-blue-600 text-white rounded-lg flex flex-col items-center">
                <i className="fab fa-facebook-f text-2xl mb-1"></i>
                <span className="text-sm">Facebook</span>
              </button>
              <button onClick={() => handleShareAction('linkedin')} className="p-4 bg-blue-700 text-white rounded-lg flex flex-col items-center">
                <i className="fab fa-linkedin-in text-2xl mb-1"></i>
                <span className="text-sm">LinkedIn</span>
              </button>
              <button onClick={() => handleShareAction('twitter')} className="p-4 bg-sky-500 text-white rounded-lg flex flex-col items-center">
                <i className="fab fa-twitter text-2xl mb-1"></i>
                <span className="text-sm">Twitter</span>
              </button>
              <button onClick={() => handleShareAction('email')} className="p-4 bg-gray-600 text-white rounded-lg flex flex-col items-center">
                <i className="fas fa-envelope text-2xl mb-1"></i>
                <span className="text-sm">Email</span>
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href + `#/posts/${shareModal.post?._id}`); alert('Link copied to clipboard!'); closeShareModal(); }} className="p-4 bg-purple-600 text-white rounded-lg flex flex-col items-center">
                <i className="fas fa-link text-2xl mb-1"></i>
                <span className="text-sm">Copy Link</span>
              </button>
            </div>
            <div className="text-center">
              <button onClick={closeShareModal} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default Home;