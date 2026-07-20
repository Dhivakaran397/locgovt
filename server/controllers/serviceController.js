const GovtService = require('../models/GovtService');

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/services
// Returns a paginated list of all government services
// ──────────────────────────────────────────────────────────────────────────────
const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const category = req.query.category || null;
    const search = req.query.search || null;
    const type = req.query.type || null; // 'services' or 'schemes'
    const sort = req.query.sort || 'popular';
    const skip = (page - 1) * limit;

    const filter = {};

    // 1. Type partitioning filter
    if (type === 'schemes') {
      filter.category = {
        $in: ['Social Welfare', 'Education & Scholarships', 'Agriculture & Farming', 'Employment & Pensions'],
      };
    } else if (type === 'services') {
      filter.category = {
        $in: ['Identity & Documents', 'Health & Medical', 'Finance & Banking', 'Housing & Infrastructure', 'Transport & Vehicle'],
      };
    } else if (type === 'students') {
      filter.category = 'Education & Scholarships';
    }

    // Overwrite category filter if specific category is selected
    if (category && category !== 'All') {
      filter.category = category;
    }

    // 2. Search regex filter (case-insensitive search across serviceName and description)
    if (search && search.trim() !== '') {
      filter.$or = [
        { serviceName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // 3. Sorting options
    let sortObj = { globalClickCount: -1 };
    if (sort === 'rating') {
      sortObj = { averageRating: -1, totalFeedback: -1 };
    } else if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'name') {
      sortObj = { serviceName: 1 };
    }

    const [services, total] = await Promise.all([
      GovtService.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      GovtService.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: services,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('getAllServices error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services. Please try again.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/services/:id
// Returns a single government service by ID
// ──────────────────────────────────────────────────────────────────────────────
const getServiceById = async (req, res) => {
  try {
    const service = await GovtService.findById(req.params.id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error('getServiceById error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch service.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/services/recommendations?district=USER_DISTRICT
// MongoDB Aggregation Pipeline: dynamically extracts district click count from
// the districtWiseClicks Map field using $getField + $ifNull, then sorts by
// district popularity DESC, global popularity DESC, limited to top 4.
// ──────────────────────────────────────────────────────────────────────────────
// GET /api/services/recommendations?district=USER_DISTRICT
//
// WEIGHTED SCORING FORMULA:
//   Score = (districtClicks × 3) + (globalClickCount × 1)
//
// District clicks are weighted 3× heavier than global clicks so that
// hyper-local popular services surface above nationally popular ones.
// The district parameter is OPTIONAL — when omitted (guest / logged-out),
// the pipeline falls back to pure global ranking (all districtClicks = 0,
// so Score = globalClickCount × 1).
// ──────────────────────────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    const district          = (req.query.district || '').trim();
    const hasDistrict       = district.length > 0;
    const DISTRICT_WEIGHT   = 3; // District clicks are worth 3× global
    const GLOBAL_WEIGHT     = 1; // Global clicks base weight

    const pipeline = [
      // ── Stage 1: Only surface actively UP services ─────────────────────
      {
        $match: {
          'currentStatus.indicator': { $in: ['UP', null, undefined] },
        },
      },

      // ── Stage 2: Extract district-specific click count from Map field ───
      // districtWiseClicks is stored as a MongoDB Map (plain Object).
      // $objectToArray converts { "Coimbatore": 42 } → [{ k:"Coimbatore", v:42 }]
      // $filter isolates the entry matching the requested district.
      {
        $addFields: {
          districtClicksArray: hasDistrict
            ? {
                $filter: {
                  input: { $objectToArray: { $ifNull: ['$districtWiseClicks', {}] } },
                  as:    'entry',
                  cond:  { $eq: ['$$entry.k', district] },
                },
              }
            : [],
        },
      },

      // ── Stage 3: Resolve scalar districtClicks (0 if not found) ────────
      {
        $addFields: {
          districtClicks: {
            $ifNull: [
              { $arrayElemAt: ['$districtClicksArray.v', 0] },
              0,
            ],
          },
        },
      },

      // ── Stage 4: Compute weighted popularity score ──────────────────────
      //   Score = (districtClicks × 3) + (globalClickCount × 1)
      {
        $addFields: {
          weightedScore: {
            $add: [
              { $multiply: ['$districtClicks',   DISTRICT_WEIGHT] },
              { $multiply: [{ $ifNull: ['$globalClickCount', 0] }, GLOBAL_WEIGHT] },
            ],
          },
        },
      },

      // ── Stage 5: Sort by weighted score DESC, then alphabetically ───────
      {
        $sort: {
          weightedScore:   -1,
          globalClickCount: -1,
          name:              1,
        },
      },

      // ── Stage 6: Top 4 recommendations ─────────────────────────────────
      { $limit: 4 },

      // ── Stage 7: Expose computed score, hide temporary arrays ───────────
      {
        $project: {
          districtClicksArray: 0,
        },
      },
    ];

    const recommendations = await GovtService.aggregate(pipeline);

    return res.status(200).json({
      success:  true,
      district: district || null,
      formula:  `Score = (districtClicks × ${DISTRICT_WEIGHT}) + (globalClickCount × ${GLOBAL_WEIGHT})`,
      data:     recommendations,
    });
  } catch (error) {
    console.error('getRecommendations error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations.',
      error:   error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/services/:id/click
// Atomically increments globalClickCount AND the district-specific key inside
// the districtWiseClicks Map using MongoDB's $inc with dynamic nested key path.
// ──────────────────────────────────────────────────────────────────────────────
const trackClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { district } = req.body;

    if (!district || district.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Request body must include "district".',
      });
    }

    const sanitizedDistrict = district.trim();

    // Build the dynamic key path for the districtWiseClicks Map
    const districtKey = `districtWiseClicks.${sanitizedDistrict}`;

    // Atomic operation: increment both global count and district-specific count
    const updatedService = await GovtService.findByIdAndUpdate(
      id,
      {
        $inc: {
          globalClickCount: 1,
          [districtKey]: 1,
        },
      },
      { new: true, runValidators: false }
    ).lean();

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Click tracked successfully.',
      data: {
        serviceId: updatedService._id,
        globalClickCount: updatedService.globalClickCount,
        districtClicks: updatedService.districtWiseClicks?.[sanitizedDistrict] ?? 1,
      },
    });
  } catch (error) {
    console.error('trackClick error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to track click.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/services/:id/report-down
// Increments downVotesCount and toggles currentStatus.indicator to 'DOWN'
// if down votes reach a threshold of 5 or more.
// ──────────────────────────────────────────────────────────────────────────────
const reportServiceDown = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await GovtService.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    // Atomically increment downVotesCount
    service.currentStatus.downVotesCount += 1;

    // Auto-flag as DOWN when threshold is reached
    const DOWN_VOTE_THRESHOLD = 5;
    if (service.currentStatus.downVotesCount >= DOWN_VOTE_THRESHOLD) {
      service.currentStatus.indicator = 'DOWN';
    }

    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service issue reported.',
      data: {
        serviceId: service._id,
        currentStatus: service.currentStatus,
      },
    });
  } catch (error) {
    console.error('reportServiceDown error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to report service issue.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/services
// Creates a new government service entry (admin/seed use)
// ──────────────────────────────────────────────────────────────────────────────
const createService = async (req, res) => {
  try {
    const { serviceName, category, officialUrl, description } = req.body;

    if (!serviceName || !category || !officialUrl) {
      return res.status(400).json({
        success: false,
        message: 'serviceName, category, and officialUrl are required.',
      });
    }

    const newService = new GovtService({
      serviceName,
      category,
      officialUrl,
      description: description || '',
    });

    const savedService = await newService.save();

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: savedService,
    });
  } catch (error) {
    console.error('createService error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create service.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  getRecommendations,
  trackClick,
  reportServiceDown,
  createService,
};
