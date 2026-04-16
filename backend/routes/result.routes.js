// ✅ DONE — Phase 5: Result routes (leaderboard + student results)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getMyResults,
  getLeaderboard,
} = require('../controllers/result.controller');

// All routes require authentication
router.use(verifyToken);

// GET /api/results/me — student's own results with per-question breakdown
router.get('/me', getMyResults);

// GET /api/results/test/:testId — leaderboard for a test (admin or any authenticated user)
router.get('/test/:testId', getLeaderboard);

module.exports = router;
