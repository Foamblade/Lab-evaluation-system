// ✅ DONE — Phase 5: Submission routes
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const {
  submitCode,
  getSubmissions,
} = require('../controllers/submission.controller');

// All routes require authentication
router.use(verifyToken);

// POST /api/submissions — submit code (student only)
router.post('/', requireStudent, submitCode);

// GET  /api/submissions?testId=...&questionId=... — get user's submission history
router.get('/', getSubmissions);

module.exports = router;
