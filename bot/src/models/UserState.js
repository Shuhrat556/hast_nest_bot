const mongoose = require('mongoose');

const STEPS = ['idle', 'choose_language', 'choose_room', 'choose_count', 'await_reason'];

/**
 * step:
 * - idle: no active flow (after completion or initial)
 * - choose_room: shown room list, waiting callback
 * - choose_count: shown count buttons
 * - await_reason: waiting for free-text reason
 */
const userStateSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    step: {
      type: String,
      required: true,
      default: 'idle',
      enum: STEPS,
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'tj'],
      default: null,
    },
    room: {
      type: String,
      default: null,
      maxlength: 200,
    },
    max: {
      type: Number,
      default: null,
      min: 0,
    },
    count: {
      type: Number,
      default: null,
      min: 0,
    },
    missing: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.UserState || mongoose.model('UserState', userStateSchema);
