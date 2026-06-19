// ✅ DONE — Submission routes: run (no save) + submit (save) + test lock
const express = require('express');
const router = express.Router();
const { runCode, submitCode, getSubmissions, submitTest, checkTestSubmitted } = require('../controllers/submission.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// POST /api/submissions/run — run code (student preview, NOT saved to DB)
router.post('/run', runCode);

// POST /api/submissions — submit code (SAVED to DB, visible to admin)
router.post('/', submitCode);

// POST /api/submissions/submit-test — finalize test (lock out)
router.post('/submit-test', submitTest);

// GET /api/submissions/check-submitted/:testId — check if already submitted
router.get('/check-submitted/:testId', checkTestSubmitted);

// GET /api/submissions — get user's submissions
router.get('/', getSubmissions);

module.exports = router;
