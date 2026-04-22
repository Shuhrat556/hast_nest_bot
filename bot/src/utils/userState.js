const UserState = require('../models/UserState');
const { getLogger } = require('./logger');
const { AppError } = require('../errors/AppError');
const { DATABASE } = require('../errors/codes');
const { FLOW_STEPS } = require('../domain/flowSteps');

/**
 * @param {number} userId
 * @param {Record<string, unknown>} set
 */
async function upsertUserState(userId, set) {
  const log = getLogger();
  try {
    return await UserState.findOneAndUpdate(
      { userId },
      { $set: { userId, ...set } },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (err) {
    log.error('upsertUserState failed', { err, userId });
    throw new AppError('Could not save session state', {
      code: DATABASE,
      userMessage: 'Could not save your progress. Try /start again.',
      cause: err,
    });
  }
}

/**
 * Reset flow fields; keeps userId, sets step to idle.
 * @param {number} userId
 */
async function clearFlow(userId) {
  return upsertUserState(userId, {
    step: FLOW_STEPS.IDLE,
    room: null,
    roomId: null,
    max: null,
    count: null,
    missing: null,
  });
}

/**
 * @param {number} userId
 */
async function getUserState(userId) {
  const log = getLogger();
  try {
    return await UserState.findOne({ userId }).lean();
  } catch (err) {
    log.error('getUserState failed', { err, userId });
    throw new AppError('Could not load session state', {
      code: DATABASE,
      userMessage: 'Something went wrong. Try /start again.',
      cause: err,
    });
  }
}

/**
 * Mark that user has submitted today's report; resets reminder flag.
 * @param {number} userId
 * @param {string | null} roomName
 */
async function markReportSubmitted(userId, roomName = null) {
  return upsertUserState(userId, {
    lastReportAt: new Date(),
    reminderSentAt: null,
    lastReportedRoom: roomName || null,
  });
}

module.exports = {
  upsertUserState,
  clearFlow,
  getUserState,
  markReportSubmitted,
};
