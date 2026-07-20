const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  getRecommendations,
  trackClick,
  reportServiceDown,
  createService,
} = require('../controllers/serviceController');
const {
  submitFeedback,
  getServiceFeedback,
} = require('../controllers/feedbackController');

// ── Service CRUD ────────────────────────────────────────────────────────────
// GET  /api/services                        → paginated list of all services
router.get('/', getAllServices);

// GET  /api/services/recommendations        → district-aware recommendations
// NOTE: This route MUST be defined before /:id to prevent 'recommendations'
//       being treated as a MongoDB ObjectId.
router.get('/recommendations', getRecommendations);

// GET  /api/services/:id                    → single service detail
router.get('/:id', getServiceById);

// POST /api/services                        → create new service (admin/seed)
router.post('/', createService);

// ── Interaction Routes ──────────────────────────────────────────────────────
// POST /api/services/:id/click              → track click with district
router.post('/:id/click', trackClick);

// POST /api/services/:id/report-down        → report service as down
router.post('/:id/report-down', reportServiceDown);

// ── Feedback Routes ─────────────────────────────────────────────────────────
// POST /api/services/:id/feedback           → submit feedback + award XP
router.post('/:id/feedback', submitFeedback);

// GET  /api/services/:id/feedback           → paginated feedback for service
router.get('/:id/feedback', getServiceFeedback);

module.exports = router;
