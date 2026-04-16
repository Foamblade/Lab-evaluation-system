// ✅ DONE — Test model with isLive and endTime virtuals
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: is the test currently live?
testSchema.virtual('isLive').get(function () {
  const now = Date.now();
  const start = this.startTime.getTime();
  const end = start + this.duration * 60000;
  return now >= start && now <= end;
});

// Virtual: calculated end time
testSchema.virtual('endTime').get(function () {
  return new Date(this.startTime.getTime() + this.duration * 60000);
});

module.exports = mongoose.model('Test', testSchema);
