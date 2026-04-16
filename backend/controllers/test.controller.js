// ✅ DONE — Phase 5: Test controller (CRUD)
const Test = require('../models/Test');
const Question = require('../models/Question');

// POST /api/tests — create a test (admin)
const createTest = async (req, res) => {
  try {
    const { title, questions, duration, startTime } = req.body;

    if (!title || !duration || !startTime) {
      return res.status(400).json({ message: 'Title, duration, and startTime are required' });
    }

    // Validate question IDs if provided
    if (questions && questions.length > 0) {
      const found = await Question.countDocuments({ _id: { $in: questions } });
      if (found !== questions.length) {
        return res.status(400).json({ message: 'One or more question IDs are invalid' });
      }
    }

    const test = await Test.create({
      title,
      questions: questions || [],
      duration,
      startTime: new Date(startTime),
      createdBy: req.user._id,
    });

    const populated = await Test.findById(test._id).populate('questions', 'title difficulty');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create test' });
  }
};

// GET /api/tests — list all tests
const getTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('questions', 'title difficulty')
      .populate('createdBy', 'name')
      .sort({ startTime: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
};

// GET /api/tests/:id — get a single test
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions') // full question data for students taking the test
      .populate('createdBy', 'name');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // For students, strip hidden test cases
    if (req.user.role === 'student') {
      const sanitized = test.toObject();
      sanitized.questions = sanitized.questions.map((q) => ({
        ...q,
        testCases: q.testCases.filter((tc) => !tc.isHidden),
      }));
      return res.json(sanitized);
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch test' });
  }
};

// PUT /api/tests/:id — update a test (admin)
const updateTest = async (req, res) => {
  try {
    const { title, questions, duration, startTime } = req.body;

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (title) test.title = title;
    if (questions) test.questions = questions;
    if (duration) test.duration = duration;
    if (startTime) test.startTime = new Date(startTime);

    await test.save();

    const populated = await Test.findById(test._id)
      .populate('questions', 'title difficulty')
      .populate('createdBy', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update test' });
  }
};

// DELETE /api/tests/:id — delete a test (admin)
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await test.deleteOne();
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete test' });
  }
};

module.exports = { createTest, getTests, getTestById, updateTest, deleteTest };
