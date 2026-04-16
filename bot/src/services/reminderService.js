const UserState = require('../models/UserState');
const { upsertUserState } = require('../utils/userState');
const { normalizeLang, t } = require('../utils/i18n');
const { getLogger } = require('../utils/logger');

const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 5 * 60 * 1000;

/**
 * @param {import('telegraf').Telegraf} bot
 */
function startReminderJob(bot) {
  const log = getLogger();

  const run = async () => {
    const now = Date.now();
    try {
      const users = await UserState.find({ lastReportAt: { $ne: null } }).lean();
      for (const user of users) {
        if (!user?.userId || !user?.lastReportAt) continue;
        const lastReportAt = new Date(user.lastReportAt).getTime();
        if (!Number.isFinite(lastReportAt)) continue;

        const dueAt = lastReportAt + DAY_MS;
        if (now < dueAt) continue;

        const reminderSentAt = user.reminderSentAt
          ? new Date(user.reminderSentAt).getTime()
          : 0;
        // Send only once per report cycle.
        if (reminderSentAt >= lastReportAt) continue;

        const lang = normalizeLang(user.language);
        const message = t(lang, 'dailyReminder');
        try {
          await bot.telegram.sendMessage(user.userId, message);
          await upsertUserState(user.userId, { reminderSentAt: new Date() });
          log.info('Daily reminder sent', { userId: user.userId, lang });
        } catch (err) {
          const code = err?.response?.error_code;
          log.warn('Failed to send reminder', {
            userId: user.userId,
            code,
            message: err?.message,
          });
          // Avoid infinite spam loop when bot is blocked by user.
          if (code === 403) {
            await upsertUserState(user.userId, { reminderSentAt: new Date() });
          }
        }
      }
    } catch (err) {
      log.error('Reminder job failed', { err });
    }
  };

  const timer = setInterval(() => {
    run().catch((err) => log.error('Reminder tick failed', { err }));
  }, CHECK_EVERY_MS);
  timer.unref?.();
  run().catch((err) => log.error('Initial reminder run failed', { err }));
  log.info('Reminder scheduler started', { everyMs: CHECK_EVERY_MS });

  return timer;
}

module.exports = { startReminderJob };
