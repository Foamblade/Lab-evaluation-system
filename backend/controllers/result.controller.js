// ✅ DONE — Phase 5: Result controller (leaderboard + student results)
const TestResult = require('../models/TestResult');
const Submission = require('../models/Submission');
const Test = require('../models/Test');

// GET /api/results/me — student's own results across all tests
const getMyResults = async (req, res) => {
  try {
    const results = await TestResult.find({ student: req.user._id })
      .populate({
        path: 'test',
        select: 'title duration startTime questions',
        populate: { path: 'questions', select: 'title' },
      })
      .sort({ completedAt: -1 });

    // Enrich with per-question submission details
    const enriched = await Promise.all(
      results.map(async (r) => {
        const result = r.toObject();

        // Get best submission for each question in this test
        if (result.test && result.test.questions) {
          result.submissions = await Promise.all(
            result.test.questions.map(async (q) => {
              const best = await Submission.findOne({
                student: req.user._id,
                test: result.test._id,
                question: q._id,
              })
                .sort({ score: -1 })
                .select('verdict score language executionTime');

              return {
                questionTitle: q.title,
                verdict: best?.verdict || 'pending',
                score: best?.score || 0,
                language: best?.language || '',
                executionTime: best?.executionTime || 0,
              };
            })
          );
        }

        return result;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

// GET /api/results/test/:testId — leaderboard for a specific test
const getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId)
      .populate('questions', 'title difficulty');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const results = await TestResult.find({ test: testId })
      .populate('student', 'name email')
      .sort({ totalScore: -1, completedAt: 1 }); // higher score first, earlier completion for ties

    // Get per-question verdicts for each student
    const leaderboard = await Promise.all(
      results.map(async (r, index) => {
        const entry = r.toObject();
        entry.rank = index + 1;

        // Get best verdict for each question
        entry.questionVerdicts = await Promise.all(
          test.questions.map(async (q) => {
            const best = await Submission.findOne({
              student: r.student._id,
              test: testId,
              question: q._id,
            })
              .sort({ score: -1 })
              .select('verdict score');

            return {
              questionId: q._id,
              questionTitle: q.title,
              verdict: best?.verdict || 'pending',
              score: best?.score || 0,
            };
          })
        );

        return entry;
      })
    );

    res.json({
      test: {
        _id: test._id,
        title: test.title,
        duration: test.duration,
        startTime: test.startTime,
        questionCount: test.questions.length,
        questions: test.questions,
      },
      totalStudents: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

module.exports = { getMyResults, getLeaderboard };
