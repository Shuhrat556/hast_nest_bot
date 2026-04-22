const { AppError } = require('../errors/AppError');
const { TELEGRAM } = require('../errors/codes');
const { formatFullReport, formatPartialReport } = require('../utils/report');
const { getLogger } = require('../utils/logger');
const { createHastNestReport } = require('./hastNestReportService');

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
 * @param {{ userId: number, roomId?: number | null, room: string, count: number, max: number, lang?: string }} payload
 */
async function sendFullAttendanceReport(telegram, groupId, payload) {
  const reportId = await createHastNestReport({
    ...payload,
    missing: 0,
    reason: null,
    kind: 'full',
  });
  const text = formatFullReport({ ...payload, reportId });
  await sendGroupMessage(telegram, groupId, text);
}

/**
 * @param {import('telegraf').Telegram} telegram
 * @param {string} groupId
 * @param {{ userId: number, roomId?: number | null, room: string, count: number, max: number, missing: number, reason: string, lang?: string }} payload
 */
async function sendPartialAttendanceReport(telegram, groupId, payload) {
  const reportId = await createHastNestReport({
    ...payload,
    kind: 'partial',
  });
  const text = formatPartialReport({ ...payload, reportId });
  await sendGroupMessage(telegram, groupId, text);
}

module.exports = {
  sendGroupMessage,
  sendFullAttendanceReport,
  sendPartialAttendanceReport,
};
