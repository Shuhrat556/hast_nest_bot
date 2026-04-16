const UserState = require('../models/UserState');
const { getLogger } = require('./logger');
const { AppError } = require('../errors/AppError');
const { DATABASE } = require('../errors/codes');

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
    step: 'idle',
    room: null,
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

module.exports = {
  upsertUserState,
  clearFlow,
  getUserState,
};
