const UserState = require('../models/UserState');
const { getLogger } = require('../utils/logger');

/**
 * @param {import('telegraf').Telegram} telegram
 * @param {string} message
 * @returns {Promise<{total:number, sent:number, failed:number}>}
 */
async function broadcastToKnownUsers(telegram, message) {
  const log = getLogger();
  const userIds = await UserState.distinct('userId');

  let sent = 0;
  let failed = 0;
  const jobs = userIds.map(async (userId) => {
    try {
      await telegram.sendMessage(userId, message);
      sent += 1;
    } catch (err) {
      failed += 1;
      log.warn('Broadcast send failed', { userId, message: err?.message });
    }
  });

  await Promise.allSettled(jobs);
  return { total: userIds.length, sent, failed };
}

module.exports = { broadcastToKnownUsers };
