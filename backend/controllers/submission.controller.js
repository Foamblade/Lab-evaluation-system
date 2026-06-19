// ✅ DONE — Submission controller with run (no save) + submit (save) + test lock
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const { evaluateCode } = require('../services/judge0.service');

// POST /api/submissions/run — run code WITHOUT saving (student-only preview)
const runCode = async (req, res) => {
  try {
    const { testId, questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return res.status(400).json({ message: 'questionId, code, and language are required' });
    }

    const validLangs = ['c', 'cpp', 'java', 'python'];
    if (!validLangs.includes(language)) {
      return res.status(400).json({ message: `Language must be one of: ${validLangs.join(', ')}` });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only evaluate against NON-HIDDEN test cases for run (student preview)
    const visibleCases = question.testCases.filter((tc) => !tc.isHidden);
    if (visibleCases.length === 0) {
      return res.status(400).json({ message: 'No visible test cases to run against' });
    }

    const evalResult = await evaluateCode(
      code,
      language,
      visibleCases,
      question.timeLimit,
      question.memoryLimit
    );

    // Return result to student — NOT saved to database
    res.json({
      verdict: evalResult.verdict,
      score: evalResult.score,
      executionTime: evalResult.executionTime,
      memoryUsed: evalResult.memoryUsed,
      compileError: evalResult.compileError || undefined,
      testResults: evalResult.testResults,
    });
  } catch (error) {
    console.error('Run error:', error.message);
    res.status(500).json({ message: error.message || 'Run failed' });
  }
};

// POST /api/submissions — submit code (SAVES to DB — visible to admin)
const submitCode = async (req, res) => {
  try {
    const { testId, questionId, code, language } = req.body;

    if (!testId || !questionId || !code || !language) {
      return res.status(400).json({
        message: 'testId, questionId, code, and language are required',
      });
    }

    const validLangs = ['c', 'cpp', 'java', 'python'];
    if (!validLangs.includes(language)) {
      return res.status(400).json({ message: `Language must be one of: ${validLangs.join(', ')}` });
    }

    // Check if student already finalized this test
    const existingResult = await TestResult.findOne({ student: req.user._id, test: testId });
    if (existingResult && existingResult.submitted) {
      return res.status(403).json({ message: 'You have already submitted this test. No more attempts allowed.' });
    }

    // Verify test exists and is live
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const now = Date.now();
    const start = test.startTime.getTime();
    const end = start + test.duration * 60000;
    if (now < start || now > end) {
      return res.status(400).json({ message: 'Test is not currently live' });
    }

    if (!test.questions.some((q) => q.toString() === questionId)) {
      return res.status(400).json({ message: 'Question does not belong to this test' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const evalResult = await evaluateCode(
      code,
      language,
      question.testCases,
      question.timeLimit,
      question.memoryLimit
    );

    const submission = await Submission.create({
      student: req.user._id,
      question: questionId,
      test: testId,
      code,
      language,
      verdict: evalResult.verdict,
      score: evalResult.score,
      executionTime: evalResult.executionTime,
      errorMessage: evalResult.compileError || '',
    });

    await updateTestResult(req.user._id, testId, submission._id, questionId, evalResult.score);

    res.status(201).json({
      submissionId: submission._id,
      verdict: evalResult.verdict,
      score: evalResult.score,
      executionTime: evalResult.executionTime,
      memoryUsed: evalResult.memoryUsed,
      compileError: evalResult.compileError || undefined,
      testResults: evalResult.testResults,
    });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ message: error.message || 'Submission failed' });
  }
};

/**
 * Update TestResult — keeps best score per question.
 */
const updateTestResult = async (studentId, testId, submissionId, questionId, score) => {
  let result = await TestResult.findOne({ student: studentId, test: testId });

  if (!result) {
    result = await TestResult.create({
      student: studentId,
      test: testId,
      totalScore: score,
      submissions: [submissionId],
      completedAt: new Date(),
    });
  } else {
    const prevSubmissions = await Submission.find({
      student: studentId,
      test: testId,
      question: questionId,
      _id: { $ne: submissionId },
    }).sort({ score: -1 }).limit(1);

    const prevBest = prevSubmissions.length > 0 ? prevSubmissions[0].score : 0;

    if (score > prevBest) {
      result.totalScore += (score - prevBest);
    }

    if (!result.submissions.includes(submissionId)) {
      result.submissions.push(submissionId);
    }
    result.completedAt = new Date();
    await result.save();
  }
};

// POST /api/submissions/submit-test — finalize test (no more attempts)
const submitTest = async (req, res) => {
  try {
    const { testId } = req.body;
    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }

    let result = await TestResult.findOne({ student: req.user._id, test: testId });

    if (result && result.submitted) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    if (!result) {
      result = await TestResult.create({
        student: req.user._id,
        test: testId,
        totalScore: 0,
        submissions: [],
        completedAt: new Date(),
        submitted: true,
      });
    } else {
      result.submitted = true;
      result.completedAt = new Date();
      await result.save();
    }

    res.json({ message: 'Test submitted successfully', totalScore: result.totalScore });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit test' });
  }
};

// GET /api/submissions/check-submitted/:testId — check if already submitted
const checkTestSubmitted = async (req, res) => {
  try {
    const result = await TestResult.findOne({
      student: req.user._id,
      test: req.params.testId,
    });

    res.json({
      submitted: result?.submitted || false,
      totalScore: result?.totalScore || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check submission status' });
  }
};

// GET /api/submissions?testId=...&questionId=...
const getSubmissions = async (req, res) => {
  try {
    const { testId, questionId } = req.query;
    const filter = { student: req.user._id };

    if (testId) filter.test = testId;
    if (questionId) filter.question = questionId;

    const submissions = await Submission.find(filter)
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

module.exports = { runCode, submitCode, getSubmissions, submitTest, checkTestSubmitted };
