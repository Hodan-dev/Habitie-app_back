const express = require('express');
const router = express.Router();
const {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Dhammaan routes-ka waa inay yihiin protected
router.use(protect);

// Get daily analytics
router.get('/daily', getDailyAnalytics);

// Get weekly analytics
router.get('/weekly', getWeeklyAnalytics);

// Get monthly analytics
router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
