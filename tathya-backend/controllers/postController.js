// tathya-backend/controllers/postController.js
const Post = require('../models/Post');
const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new post in a community
// @route   POST /api/posts
// @access  Private (Member of community)
const createPost = asyncHandler(async (req, res) => {
  // If multipart/form-data was used, text fields are in req.body and files in req.files
  const { communityId, title, content, isAnonymous = true } = req.body;

  // Basic validation (allow missing communityId for a public/global feed)
  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide title and content');
  }

  // If communityId provided, verify existence and membership
  if (communityId) {
    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404);
      throw new Error('Community not found');
    }
    if (!community.members.includes(req.user._id)) {
      res.status(401);
      throw new Error('You must be a member of the community to post');
    }
  }

  // Build attachments metadata from multer's req.files if present
  let attachments = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    attachments = req.files.map(f => ({
      filename: f.filename,
      path: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
      size: f.size,
    }));
  }

  // Create post
  const post = new Post({
    communityId: communityId || null,
    userId: req.user._id,
    title: title.trim(),
    content: content.trim(),
    isAnonymous: isAnonymous === 'false' || isAnonymous === false ? false : true,
    attachments,
  });

  const createdPost = await post.save();

  if (createdPost) {
    res.status(201).json({
      _id: createdPost._id,
      communityId: createdPost.communityId,
      userId: createdPost.userId,
      title: createdPost.title,
      content: createdPost.content,
      isAnonymous: createdPost.isAnonymous,
      attachments: createdPost.attachments,
      likes: createdPost.likes.length,
      comments: createdPost.comments.length,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid post data');
  }
});

// @desc    Get posts for a specific community
// @route   GET /api/posts/community/:communityId
// @access  Public (or Private if community is restricted)
const getPostsByCommunity = asyncHandler(async (req, res) => {
  const communityId = req.params.communityId;
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  // Check if community exists
  const community = await Community.findById(communityId);
  if (!community) {
    res.status(404);
    throw new Error('Community not found');
  }

  // In a real app, check if user has access to the community (e.g., if it's private)
  // For now, assuming public access or member-only access is handled elsewhere

  const count = await Post.countDocuments({ communityId: communityId });
  const posts = await Post.find({ communityId: communityId })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    posts,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get recent posts (global feed)
// @route   GET /api/posts
// @access  Public
const getRecentPosts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Post.countDocuments({ isVisible: true, approved: true });
  const posts = await Post.find({ isVisible: true, approved: true })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ posts, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get all posts for moderation (including unapproved posts)
// @route   GET /api/posts/moderation
// @access  Private/Moderator
const getPostsForModeration = asyncHandler(async (req, res) => {
  // Check if user is moderator
  if (req.user.role !== 'moderator') {
    res.status(403);
    throw new Error('Access denied. Moderators only.');
  }
  
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Post.countDocuments({ isVisible: true });
  const posts = await Post.find({ isVisible: true })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ posts, page, pages: Math.ceil(count / pageSize), total: count });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // In a real app, check if user has access to the community this post belongs to
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Owner of post)
const updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.findById(req.params.id);

  if (post) {
    // Check ownership (considering anonymity, owner might be the only one who can edit)
    if (post.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this post');
    }

    post.title = title || post.title;
    post.content = content || post.content;
    // isAnonymous should probably not be changeable after creation

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner of post or Moderator of community)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // Check ownership or moderation rights
    const isOwner = post.userId.toString() === req.user._id.toString();
    
    // Allow post owner to delete without community check
    if (isOwner) {
      // Use findByIdAndDelete instead of remove() which is deprecated
      await Post.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Post removed' });
    }
    
    // If not owner, check if moderator (only if post belongs to a community)
    if (post.communityId) {
      const community = await Community.findById(post.communityId);
      const isModerator = community && community.moderators.includes(req.user._id);
      
      if (isModerator) {
        await Post.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Post removed' });
      }
    }
    
    // If reached here, user is neither owner nor moderator
    res.status(401);
    throw new Error('Not authorized to delete this post');
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Like/unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      // Like
      post.likes.push(userId);
    }

    const updatedPost = await post.save();
    res.json({
      likes: updatedPost.likes.length,
    });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content, replyTo } = req.body; // replyTo is optional, for replying to a comment

  if (!content) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  const post = await Post.findById(req.params.id);

  if (post) {
    // Only check community membership if post belongs to a community
    if (post.communityId) {
      const community = await Community.findById(post.communityId);
      // Allow commenting if community doesn't exist (might be deleted) or user is a member
      if (community && !community.members.includes(req.user._id)) {
        res.status(401);
        throw new Error('You must be a member of the community to comment');
      }
    }

    const newComment = {
      userId: req.user._id,
      content: content.trim(),
      // likes will initialize as empty array
      // replies will initialize as empty array if it's a top-level comment
    };

    if (replyTo) {
      // This is a reply to an existing comment
      const commentIndex = post.comments.findIndex(c => c._id.toString() === replyTo);
      if (commentIndex === -1) {
        res.status(404);
        throw new Error('Comment to reply to not found');
      }
      post.comments[commentIndex].replies.push(newComment);
    } else {
      // This is a new top-level comment
      post.comments.push(newComment);
    }

    const updatedPost = await post.save();
    // Return the ID of the newly added comment/reply for frontend updates
    const addedComment = replyTo
      ? updatedPost.comments.find(c => c._id.toString() === replyTo)?.replies.slice(-1)[0]
      : updatedPost.comments.slice(-1)[0];

    res.status(201).json({
      message: 'Comment added',
      comment: addedComment,
    });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Like/unlike a comment or reply
// @route   POST /api/posts/:postId/comments/:commentId/like
// @access  Private
// @route   POST /api/posts/:postId/comments/:commentId/replies/:replyId/like (for replies)
const likeComment = asyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);

  if (commentIndex === -1) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userId = req.user._id;

  if (replyId) {
    // Like/unlike a reply
    const replyIndex = post.comments[commentIndex].replies.findIndex(r => r._id.toString() === replyId);
    if (replyIndex === -1) {
      res.status(404);
      throw new Error('Reply not found');
    }

    const reply = post.comments[commentIndex].replies[replyIndex];
    if (reply.likes.includes(userId)) {
      // Unlike reply
      reply.likes = reply.likes.filter(id => !id.equals(userId));
    } else {
      // Like reply
      reply.likes.push(userId);
    }
  } else {
    // Like/unlike a top-level comment
    const comment = post.comments[commentIndex];
    if (comment.likes.includes(userId)) {
      // Unlike comment
      comment.likes = comment.likes.filter(id => !id.equals(userId));
    } else {
      // Like comment
      comment.likes.push(userId);
    }
  }

  const updatedPost = await post.save();

  // Calculate new like count for the specific comment/reply
  let newLikeCount;
  if (replyId) {
    const replyIndex = post.comments[commentIndex].replies.findIndex(r => r._id.toString() === replyId);
    newLikeCount = updatedPost.comments[commentIndex].replies[replyIndex].likes.length;
  } else {
    newLikeCount = updatedPost.comments[commentIndex].likes.length;
  }

  res.json({
    likes: newLikeCount,
  });
});

module.exports = {
  createPost,
  getPostsByCommunity,
  getRecentPosts,
  getPostsForModeration,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  likeComment,
};