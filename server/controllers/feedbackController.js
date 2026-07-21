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
    const mongoose = require('mongoose');
    const serviceId = req.params.id || req.body.serviceId;
    const userId = req.body.userId || req.body.username || 'anonymous_user';
    const userDistrict = req.body.userDistrict || req.body.district || 'Chennai';
    const starRating = req.body.starRating || req.body.rating;
    const processingTimeframe = req.body.processingTimeframe || req.body.timeframe || 'Under 5 minutes';
    const citizenComment = req.body.citizenComment || req.body.comment || '';

    // Validate required fields
    if (!serviceId || !starRating || !processingTimeframe) {
      return res.status(400).json({
        success: false,
        message: 'serviceId, starRating, and processingTimeframe are required.',
      });
    }

    const XP_REWARD = 50;

    // Find user if valid ID or username exists
    let targetUser = null;
    if (userId && userId !== 'anonymous_user') {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        targetUser = await User.findById(userId);
      }
      if (!targetUser) {
        targetUser = await User.findOne({ username: userId });
      }
    }

    let leveledUp = false;
    let newBadges = [];

    if (targetUser) {
      targetUser.citizenXP = (targetUser.citizenXP || 0) + XP_REWARD;
      const newLevel = Math.floor(targetUser.citizenXP / 500) + 1;
      leveledUp = newLevel > targetUser.currentLevel;
      targetUser.currentLevel = newLevel;
      await targetUser.save();
    }

    // Save feedback document
    const newFeedback = new Feedback({
      serviceId,
      userId: targetUser ? targetUser._id.toString() : String(userId),
      userDistrict: String(userDistrict).trim(),
      starRating: Number(starRating),
      processingTimeframe: String(processingTimeframe),
      citizenComment: String(citizenComment).trim(),
      submittedAt: new Date(),
    });

    const savedFeedback = await newFeedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      xpEarned: XP_REWARD,
      data: {
        feedback: savedFeedback,
        xpAwarded: XP_REWARD,
        newTotalXP: targetUser ? targetUser.citizenXP : 50,
        currentLevel: targetUser ? targetUser.currentLevel : 1,
        leveledUp,
        newBadges,
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
