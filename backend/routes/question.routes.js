// ✅ DONE — Phase 5: Question routes (CRUD)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question.controller');

// All routes require authentication
router.use(verifyToken);

// GET  /api/questions     — list all questions (admin: full data, student: title+difficulty)
router.get('/', getQuestions);

// GET  /api/questions/:id — get single question (students don't see hidden test cases)
router.get('/:id', getQuestionById);

// POST /api/questions     — create question (admin only)
router.post('/', requireAdmin, createQuestion);

// PUT  /api/questions/:id — update question (admin only)
router.put('/:id', requireAdmin, updateQuestion);

// DELETE /api/questions/:id — delete question (admin only)
router.delete('/:id', requireAdmin, deleteQuestion);

module.exports = router;
