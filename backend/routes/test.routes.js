// ✅ DONE — Phase 5: Test routes (CRUD)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
} = require('../controllers/test.controller');

// All routes require authentication
router.use(verifyToken);

// GET  /api/tests     — list all tests (any authenticated user)
router.get('/', getTests);

// GET  /api/tests/:id — get single test (any authenticated user; hides test cases for students)
router.get('/:id', getTestById);

// POST /api/tests     — create test (admin only)
router.post('/', requireAdmin, createTest);

// PUT  /api/tests/:id — update test (admin only)
router.put('/:id', requireAdmin, updateTest);

// DELETE /api/tests/:id — delete test (admin only)
router.delete('/:id', requireAdmin, deleteTest);

module.exports = router;
