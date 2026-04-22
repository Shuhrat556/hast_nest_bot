const mongoose = require('mongoose');

const hastNestReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    roomId: {
      type: Number,
      default: null,
      index: true,
    },
    room: {
      type: String,
      required: true,
      maxlength: 200,
    },
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
    missing: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: null,
      maxlength: 4000,
    },
    lang: {
      type: String,
      enum: ['en', 'ru', 'tj'],
      default: 'en',
    },
    kind: {
      type: String,
      enum: ['full', 'partial'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.HastNestReport ||
  mongoose.model('HastNestReport', hastNestReportSchema);
