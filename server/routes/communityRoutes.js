const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  upvotePost,
  getPostById,
} = require('../controllers/communityController');

// GET  /api/community                       → paginated posts (filter by district, sort by trending)
router.get('/', getPosts);

// POST /api/community                       → create new post
router.post('/', createPost);

// GET  /api/community/:id                   → single post detail
router.get('/:id', getPostById);

// POST /api/community/:id/upvote            → upvote a post (duplicate-safe)
router.post('/:id/upvote', upvotePost);

module.exports = router;
