const mongoose = require('mongoose');

const profileCredentialsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    dob: {
      type: String,
      default: '',
    },
    primaryAddress: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema(
  {
    servicesVisited: { type: Number, default: 0 },
    feedbackGiven:   { type: Number, default: 0 },
    postsCreated:    { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    // SHA-256 password hash — stripped from all API responses in the controller
    passwordHash: {
      type:    String,
      default: '',
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    citizenXP: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: [1, 'Level must be at least 1'],
    },
    // 'badges' is the canonical field (Profile.jsx uses user.badges)
    badges: {
      type: [String],
      default: [],
    },
    // Legacy alias kept for backwards compat with seed data
    unlockedBadges: {
      type: [String],
      default: [],
    },
    profile: {
      type: profileCredentialsSchema,
      default: () => ({}),
    },
    stats: {
      type: statsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook to auto-calculate level from XP
userSchema.pre('save', function (next) {
  this.currentLevel = Math.floor(this.citizenXP / 500) + 1;
  next();
});

// Static method to award XP and recalculate level atomically
userSchema.statics.awardXP = async function (userId, xpAmount) {
  const updatedUser = await this.findByIdAndUpdate(
    userId,
    { $inc: { citizenXP: xpAmount } },
    { new: true, runValidators: false }
  );

  if (!updatedUser) {
    throw new Error('User not found for XP award');
  }

  // Recalculate level based on new XP
  const newLevel = Math.floor(updatedUser.citizenXP / 500) + 1;

  // Only update level if it has changed
  if (newLevel !== updatedUser.currentLevel) {
    updatedUser.currentLevel = newLevel;

    // Unlock level badges
    const levelBadgeMap = {
      2: 'CIVIC_EXPLORER',
      5: 'SERVICE_SEEKER',
      10: 'DISTRICT_CHAMPION',
      20: 'STATE_GUARDIAN',
      50: 'NATIONAL_HERO',
    };

    if (levelBadgeMap[newLevel] && !updatedUser.unlockedBadges.includes(levelBadgeMap[newLevel])) {
      updatedUser.unlockedBadges.push(levelBadgeMap[newLevel]);
    }

    await this.findByIdAndUpdate(userId, {
      currentLevel: newLevel,
      unlockedBadges: updatedUser.unlockedBadges,
    });
  }

  return updatedUser;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
