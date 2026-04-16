// ✅ DONE — Phase 5: Submission controller
// Submit code → Judge0 evaluation → save result
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const { evaluateCode } = require('../services/judge0.service');

// POST /api/submissions — submit code for a question in a test
const submitCode = async (req, res) => {
  try {
    const { testId, questionId, code, language } = req.body;

    // Validate required fields
    if (!testId || !questionId || !code || !language) {
      return res.status(400).json({
        message: 'testId, questionId, code, and language are required',
      });
    }

    // Validate language
    const validLangs = ['c', 'cpp', 'java', 'python'];
    if (!validLangs.includes(language)) {
      return res.status(400).json({ message: `Language must be one of: ${validLangs.join(', ')}` });
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

    // Verify question belongs to this test
    if (!test.questions.some((q) => q.toString() === questionId)) {
      return res.status(400).json({ message: 'Question does not belong to this test' });
    }

    // Fetch question with ALL test cases (including hidden)
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Run code through Judge0 against all test cases
    const evalResult = await evaluateCode(
      code,
      language,
      question.testCases,
      question.timeLimit,
      question.memoryLimit
    );

    // Save the submission
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

    // Update or create TestResult (best score per question)
    await updateTestResult(req.user._id, testId, submission._id, questionId, evalResult.score);

    // Return result to frontend
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
    // Find if we already have a submission for this question
    // Get previous best score for this question
    const prevSubmissions = await Submission.find({
      student: studentId,
      test: testId,
      question: questionId,
      _id: { $ne: submissionId },
    }).sort({ score: -1 }).limit(1);

    const prevBest = prevSubmissions.length > 0 ? prevSubmissions[0].score : 0;

    // Only update totalScore if new score is higher
    if (score > prevBest) {
      result.totalScore += (score - prevBest);
    }

    // Always track the latest submission
    if (!result.submissions.includes(submissionId)) {
      result.submissions.push(submissionId);
    }
    result.completedAt = new Date();
    await result.save();
  }
};

// GET /api/submissions?testId=...&questionId=... — get user's submissions
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

module.exports = { submitCode, getSubmissions };
