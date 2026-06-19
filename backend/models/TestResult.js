// ✅ DONE — TestResult model for pre-aggregated scores (leaderboard O(1))
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    submissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One result per student per test
testResultSchema.index({ student: 1, test: 1 }, { unique: true });

// Leaderboard index — sorted by score descending
testResultSchema.index({ test: 1, totalScore: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);
