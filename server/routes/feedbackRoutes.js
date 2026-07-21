const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getServiceFeedback,
  getUserFeedback,
} = require('../controllers/feedbackController');

// POST /api/feedback - Submit new feedback
router.post('/', submitFeedback);

// GET /api/feedback/service/:id - Get feedback for a specific service
router.get('/service/:id', getServiceFeedback);

// GET /api/feedback/user/:userId - Get feedback submitted by a specific user
router.get('/user/:userId', getUserFeedback);

module.exports = router;
