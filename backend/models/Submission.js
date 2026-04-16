// ✅ DONE — Submission model
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      enum: ['c', 'cpp', 'java', 'python'],
      required: [true, 'Language is required'],
    },
    verdict: {
      type: String,
      enum: ['pending', 'AC', 'WA', 'TLE', 'CE', 'RE'],
      default: 'pending',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    executionTime: {
      type: Number, // milliseconds
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
