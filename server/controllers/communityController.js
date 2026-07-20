const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/community
// Creates a new community post
// ──────────────────────────────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and content are required.',
      });
    }

    // Fetch user to get their authorName and district
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const newPost = new CommunityPost({
      userId,
      authorName: user.profile?.fullName || user.username,
      district: user.district,
      title: title.trim(),
      content: content.trim(),
    });

    const savedPost = await newPost.save();

    // Award XP for posting to the community
    const XP_FOR_POST = 25;
    await User.findByIdAndUpdate(
      userId,
      { $inc: { citizenXP: XP_FOR_POST } },
      { runValidators: false }
    );

    return res.status(201).json({
      success: true,
      message: 'Community post created successfully.',
      data: savedPost,
      xpAwarded: XP_FOR_POST,
    });
  } catch (error) {
    console.error('createPost error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create post.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/community
// Returns paginated community posts, optionally filtered by district
// ──────────────────────────────────────────────────────────────────────────────
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { district, sort } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (district) {
      filter.district = district.trim();
    }

    // Sort by newest first, or by trending (upvotes)
    const sortOption =
      sort === 'trending'
        ? { upvotesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('getPosts error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posts.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/community/:id/upvote
// Atomically increments upvotesCount. Prevents duplicate upvotes using
// addToSet on the upvotedBy array. Returns early if already upvoted.
// ──────────────────────────────────────────────────────────────────────────────
const upvotePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required.',
      });
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Check if user already upvoted
    const alreadyUpvoted = post.upvotedBy.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (alreadyUpvoted) {
      // Toggle: Remove the upvote if already upvoted
      const updatedPost = await CommunityPost.findByIdAndUpdate(
        id,
        {
          $inc: { upvotesCount: -1 },
          $pull: { upvotedBy: userId },
        },
        { new: true, runValidators: false }
      ).lean();

      return res.status(200).json({
        success: true,
        message: 'Upvote removed successfully.',
        data: {
          upvotesCount: updatedPost.upvotesCount,
          upvotedBy:    updatedPost.upvotedBy,
        },
      });
    }

    // Atomically add user to upvotedBy and increment count
    const updatedPost = await CommunityPost.findByIdAndUpdate(
      id,
      {
        $inc: { upvotesCount: 1 },
        $addToSet: { upvotedBy: userId },
      },
      { new: true, runValidators: false }
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Post upvoted successfully.',
      data: {
        upvotesCount: updatedPost.upvotesCount,
        upvotedBy:    updatedPost.upvotedBy,
      },
    });
  } catch (error) {
    console.error('upvotePost error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to upvote post.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/community/:id
// Returns a single community post by ID
// ──────────────────────────────────────────────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('getPostById error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch post.',
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  upvotePost,
  getPostById,
};
