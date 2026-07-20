const Feedback = require('../models/Feedback');
const GovtService = require('../models/GovtService');
const User = require('../models/User');

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/services/:id/feedback
// Saves full feedback document. Concurrently triggers atomic $inc of +50 XP
// and recalculates user level via: currentLevel = Math.floor(XP / 500) + 1
// ──────────────────────────────────────────────────────────────────────────────
const submitFeedback = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const { userId, userDistrict, starRating, processingTimeframe, citizenComment } = req.body;

    // Validate required fields
    if (!userId || !userDistrict || !starRating || !processingTimeframe) {
      return res.status(400).json({
        success: false,
        message: 'userId, userDistrict, starRating, and processingTimeframe are required.',
      });
    }

    // Confirm service exists
    const serviceExists = await GovtService.findById(serviceId).lean();
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Government service not found.',
      });
    }

    // Confirm user exists
    const userExists = await User.findById(userId).lean();
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Build the feedback document
    const newFeedback = new Feedback({
      serviceId,
      userId,
      userDistrict: userDistrict.trim(),
      starRating: Number(starRating),
      processingTimeframe,
      citizenComment: citizenComment ? citizenComment.trim() : '',
      submittedAt: new Date(),
    });

    // XP_REWARD per feedback submission
    const XP_REWARD = 50;

    // Execute feedback save AND XP increment concurrently
    const [savedFeedback] = await Promise.all([
      newFeedback.save(),
      User.findByIdAndUpdate(
        userId,
        { $inc: { citizenXP: XP_REWARD } },
        { new: false, runValidators: false }
      ),
    ]);

    // After the $inc, fetch the latest XP to recalculate level
    const freshUser = await User.findById(userId);

    if (!freshUser) {
      return res.status(404).json({
        success: false,
        message: 'User disappeared after XP update — unexpected error.',
      });
    }

    // Recalculate level using the canonical formula
    const newLevel = Math.floor(freshUser.citizenXP / 500) + 1;
    const leveledUp = newLevel > freshUser.currentLevel;

    // Unlock level-gated badges
    const levelBadgeMap = {
      2: 'CIVIC_EXPLORER',
      5: 'SERVICE_SEEKER',
      10: 'DISTRICT_CHAMPION',
      20: 'STATE_GUARDIAN',
      50: 'NATIONAL_HERO',
    };

    const newBadges = [];
    if (levelBadgeMap[newLevel] && !freshUser.unlockedBadges.includes(levelBadgeMap[newLevel])) {
      freshUser.unlockedBadges.push(levelBadgeMap[newLevel]);
      newBadges.push(levelBadgeMap[newLevel]);
    }

    // Persist level and badge updates
    freshUser.currentLevel = newLevel;
    await freshUser.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: {
        feedback: savedFeedback,
        xpAwarded: XP_REWARD,
        newTotalXP: freshUser.citizenXP,
        currentLevel: freshUser.currentLevel,
        leveledUp,
        newBadges,
        xpProgressPercent: Math.min(
          Math.round(((freshUser.citizenXP - (freshUser.currentLevel - 1) * 500) / 500) * 100),
          100
        ),
      },
    });
  } catch (error) {
    console.error('submitFeedback error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Feedback validation failed.',
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/services/:id/feedback
// Returns paginated feedback for a specific service
// ──────────────────────────────────────────────────────────────────────────────
const getServiceFeedback = async (req, res) => {
  try {
    const { id: serviceId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [feedbackList, total] = await Promise.all([
      Feedback.find({ serviceId })
        .populate('userId', 'username district currentLevel')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments({ serviceId }),
    ]);

    // Calculate aggregate stats for this service
    const stats = await Feedback.aggregate([
      { $match: { serviceId: require('mongoose').Types.ObjectId.createFromHexString(serviceId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$starRating' },
          totalFeedback: { $sum: 1 },
          ratingDistribution: {
            $push: '$starRating',
          },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ['$averageRating', 1] },
          totalFeedback: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: feedbackList,
      stats: stats[0] || { averageRating: 0, totalFeedback: 0 },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('getServiceFeedback error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/users/:userId/feedback
// Returns all feedback submitted by a specific user
// ──────────────────────────────────────────────────────────────────────────────
const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [feedbackList, total] = await Promise.all([
      Feedback.find({ userId })
        .populate('serviceId', 'serviceName category officialUrl')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: feedbackList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('getUserFeedback error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user feedback.',
      error: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  getServiceFeedback,
  getUserFeedback,
};
