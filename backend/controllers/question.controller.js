// ✅ DONE — Phase 5: Question controller (CRUD)
const Question = require('../models/Question');

// POST /api/questions — create a question (admin)
const createQuestion = async (req, res) => {
  try {
    const { title, description, testCases, timeLimit, memoryLimit, difficulty } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ message: 'At least one test case is required' });
    }

    const question = await Question.create({
      title,
      description,
      testCases,
      timeLimit: timeLimit || 2,
      memoryLimit: memoryLimit || 128,
      difficulty: difficulty || 'medium',
      createdBy: req.user._id,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create question' });
  }
};

// GET /api/questions — list all questions
// Admin gets full data; students only get title + difficulty (for test selection UIs)
const getQuestions = async (req, res) => {
  try {
    let query = Question.find().sort({ createdAt: -1 });

    if (req.user.role !== 'admin') {
      query = query.select('title difficulty timeLimit memoryLimit');
    }

    const questions = await query;
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

// GET /api/questions/:id — get a single question
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Students don't see hidden test cases
    if (req.user.role === 'student') {
      const sanitized = question.toObject();
      sanitized.testCases = sanitized.testCases.filter((tc) => !tc.isHidden);
      return res.json(sanitized);
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question' });
  }
};

// PUT /api/questions/:id — update a question (admin)
const updateQuestion = async (req, res) => {
  try {
    const { title, description, testCases, timeLimit, memoryLimit, difficulty } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (title) question.title = title;
    if (description) question.description = description;
    if (testCases) question.testCases = testCases;
    if (timeLimit !== undefined) question.timeLimit = timeLimit;
    if (memoryLimit !== undefined) question.memoryLimit = memoryLimit;
    if (difficulty) question.difficulty = difficulty;

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update question' });
  }
};

// DELETE /api/questions/:id — delete a question (admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question' });
  }
};

module.exports = { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion };
