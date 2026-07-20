const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GovtService',
      required: [true, 'Service ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userDistrict: {
      type: String,
      required: [true, 'User district is required'],
      trim: true,
    },
    starRating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    processingTimeframe: {
      type: String,
      required: [true, 'Processing timeframe is required'],
      enum: {
        values: ['Under 3 Days', '1 Week', '2-4 Weeks', 'Over a Month'],
        message:
          'Processing timeframe must be one of: Under 3 Days, 1 Week, 2-4 Weeks, Over a Month',
      },
    },
    citizenComment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Compound index to look up all feedback for a specific service
feedbackSchema.index({ serviceId: 1, submittedAt: -1 });
// Index to look up all feedback submitted by a specific user
feedbackSchema.index({ userId: 1, submittedAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
