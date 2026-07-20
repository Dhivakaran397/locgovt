const mongoose = require('mongoose');

const currentStatusSchema = new mongoose.Schema(
  {
    indicator: {
      type: String,
      enum: {
        values: ['UP', 'DOWN'],
        message: 'Status indicator must be either UP or DOWN',
      },
      default: 'UP',
    },
    downVotesCount: {
      type: Number,
      default: 0,
      min: [0, 'Down votes count cannot be negative'],
    },
  },
  { _id: false }
);

const govtServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [120, 'Service name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Identity & Documents',
        'Health & Medical',
        'Education & Scholarships',
        'Agriculture & Farming',
        'Finance & Banking',
        'Housing & Infrastructure',
        'Employment & Pensions',
        'Transport & Vehicle',
        'Social Welfare',
        'Other',
      ],
    },
    officialUrl: {
      type: String,
      required: [true, 'Official URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    guidelines: {
      en: { type: [String], default: [] },
      ta: { type: [String], default: [] },
      hi: { type: [String], default: [] },
    },
    globalClickCount: {
      type: Number,
      default: 0,
      min: [0, 'Global click count cannot be negative'],
    },
    districtWiseClicks: {
      type: Map,
      of: Number,
      default: {},
    },
    currentStatus: {
      type: currentStatusSchema,
      default: () => ({ indicator: 'UP', downVotesCount: 0 }),
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast sorting by global popularity
govtServiceSchema.index({ globalClickCount: -1 });
govtServiceSchema.index({ category: 1 });

const GovtService = mongoose.model('GovtService', govtServiceSchema);

module.exports = GovtService;
