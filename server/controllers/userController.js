const crypto = require('crypto');
const User   = require('../models/User');

// ─── Password helpers (no external deps, uses Node crypto) ────────────────────
const hashPassword = (password) =>
  crypto.createHash('sha256').update(password + 'locgovt_salt_2026').digest('hex');

const verifyPassword = (password, hash) => hashPassword(password) === hash;

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/users/register
// Creates a new citizen account with hashed password
// ──────────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { username, password, district, state, profile } = req.body;

    if (!username || !password || !district || !state) {
      return res.status(400).json({
        success: false,
        message: 'username, password, district, and state are all required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const usernameClean = username.trim().toLowerCase();

    const existing = await User.findOne({ username: usernameClean }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    const newUser = new User({
      username:     usernameClean,
      passwordHash: hashPassword(password),
      district:     district.trim(),
      state:        state.trim(),
      profile:      profile || {},
      citizenXP:    50,   // welcome XP bonus
      currentLevel: 1,
    });

    const saved = await newUser.save();

    // Return safe user object (no passwordHash)
    const safeUser = { ...saved.toObject() };
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! +50 Welcome XP awarded.',
      data:    safeUser,
    });
  } catch (error) {
    console.error('registerUser error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username is already taken.' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/users/login
// Authenticates a citizen by username + password
// ──────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required.' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Support legacy accounts created without a password (migrate on first login)
    if (!user.passwordHash) {
      user.passwordHash = hashPassword(password);
      await user.save();
    } else if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data:    safeUser,
    });
  } catch (error) {
    console.error('loginUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/users  (alias for register — backwards compat)
// ──────────────────────────────────────────────────────────────────────────────
const createUser = registerUser;

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id
// Returns a single user profile by MongoDB ObjectId
// ──────────────────────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error('getUserById error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/users/username/:username
// Look up a user by username
// ──────────────────────────────────────────────────────────────────────────────
const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error('getUserByUsername error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:username
// Updates profile fields: fullName, bio, state, district
// Accepts username (string) OR ObjectId in :id param
// ──────────────────────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['district', 'state', 'profile'];
    const updates = {};

    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    // Support both ObjectId and username as the param
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query      = isObjectId
      ? { _id: req.params.id }
      : { username: req.params.id.toLowerCase() };

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found.' });

    const safeUser = { ...updatedUser };
    delete safeUser.passwordHash;

    return res.status(200).json({ success: true, message: 'Profile updated.', data: safeUser });
  } catch (error) {
    console.error('updateUser error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to update user.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:username/password
// Change user password (requires currentPassword verification)
// ──────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.username);
    const query      = isObjectId
      ? { _id: req.params.username }
      : { username: req.params.username.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Allow migration for passwordless legacy accounts
    if (user.passwordHash && !verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to change password.', error: error.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/users/leaderboard
// Returns top 20 citizens sorted by citizenXP descending
// ──────────────────────────────────────────────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username district state citizenXP currentLevel badges')
      .sort({ citizenXP: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('getLeaderboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  createUser,
  getUserById,
  getUserByUsername,
  updateUser,
  changePassword,
  getLeaderboard,
};
