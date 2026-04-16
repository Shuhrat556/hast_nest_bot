const { AppError } = require('../errors/AppError');
const { TELEGRAM } = require('../errors/codes');
const { formatFullReport, formatPartialReport } = require('../utils/report');
const { getLogger } = require('../utils/logger');

/**
 * @param {import('telegraf').Telegram} telegram
 * @param {string} groupId
 * @param {string} text
 */
async function sendGroupMessage(telegram, groupId, text) {
  const log = getLogger();
  try {
    await telegram.sendMessage(groupId, text);
  } catch (err) {
    log.error('Telegram sendMessage to group failed', {
      err,
      groupId,
    });
    throw new AppError('Failed to send message to group', {
      code: TELEGRAM,
      userMessage:
        'Could not post to the group. Check bot permissions and GROUP_ID.',
      cause: err,
    });
  }
}

/**
 * @param {import('telegraf').Telegram} telegram
 * @param {string} groupId
 * @param {{ room: string, count: number, max: number }} payload
 */
async function sendFullAttendanceReport(telegram, groupId, payload) {
  const text = formatFullReport(payload);
  await sendGroupMessage(telegram, groupId, text);
}

/**
 * @param {import('telegraf').Telegram} telegram
 * @param {string} groupId
 * @param {{ room: string, count: number, max: number, missing: number, reason: string }} payload
 */
async function sendPartialAttendanceReport(telegram, groupId, payload) {
  const text = formatPartialReport(payload);
  await sendGroupMessage(telegram, groupId, text);
}

module.exports = {
  sendGroupMessage,
  sendFullAttendanceReport,
  sendPartialAttendanceReport,
};
