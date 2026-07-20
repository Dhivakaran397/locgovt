const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  createUser,
  getUserById,
  getUserByUsername,
  updateUser,
  changePassword,
  getLeaderboard,
} = require('../controllers/userController');
const { getUserFeedback } = require('../controllers/feedbackController');

// ─────────────────────────────────────────────────────────────────────────────
// Auth routes (must come BEFORE /:id to avoid param conflicts)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/users/register  → create new citizen account with password
router.post('/register', registerUser);

// POST /api/users/login     → authenticate citizen
router.post('/login', loginUser);

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard (before /:id so 'leaderboard' isn't treated as ObjectId)
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/users/leaderboard   → top 20 citizens by XP
router.get('/leaderboard', getLeaderboard);

// ─────────────────────────────────────────────────────────────────────────────
// Username lookup
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/users/username/:username  → look up user by username
router.get('/username/:username', getUserByUsername);

// ─────────────────────────────────────────────────────────────────────────────
// CRUD — accepts ObjectId OR username as the :id param
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/users              → alias for register (backwards compat)
router.post('/', createUser);

// GET  /api/users/:id          → get profile by ObjectId
router.get('/:id', getUserById);

// PUT  /api/users/:id          → update profile (accepts ObjectId or username)
router.put('/:id', updateUser);

// PUT  /api/users/:username/password  → change password
router.put('/:username/password', changePassword);

// GET  /api/users/:userId/feedback    → all feedback submitted by this user
router.get('/:userId/feedback', getUserFeedback);

module.exports = router;
