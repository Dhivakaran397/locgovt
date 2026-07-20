const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [60, 'Author name cannot exceed 60 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    upvotesCount: {
      type: Number,
      default: 0,
      min: [0, 'Upvotes count cannot be negative'],
    },
    upvotedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fetching recent posts in a district
communityPostSchema.index({ district: 1, createdAt: -1 });
// Index for trending posts by upvotes
communityPostSchema.index({ upvotesCount: -1, createdAt: -1 });

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost;
