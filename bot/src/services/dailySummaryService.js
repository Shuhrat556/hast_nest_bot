const Room = require('../models/Room');
const UserState = require('../models/UserState');
const BotState = require('../models/BotState');
const { getLogger } = require('../utils/logger');
const { normalizeLang, t } = require('../utils/i18n');
const { zonedParts, zonedDateKey } = require('../utils/time');

const BOT_STATE_KEY = 'dailySummary:lastSentDateKey';
const CHECK_EVERY_MS = 60 * 1000;

/**
 * @param {import('telegraf').Telegraf} bot
 * @param {{ groupId: string, timeZone: string, hour: number }} cfg
 */
function startDailySummaryJob(bot, cfg) {
  const log = getLogger();
  const { groupId, timeZone, hour } = cfg;

  const run = async () => {
    const now = new Date();
    const parts = zonedParts(now, timeZone);
    const todayKey = zonedDateKey(now, timeZone);

    if (parts.hour !== hour || parts.minute !== 0) {
      return;
    }

    const state = await BotState.findOne({ key: BOT_STATE_KEY }).lean();
    if (state?.value === todayKey) {
      return;
    }

    const rooms = await Room.find().sort({ name: 1 }).lean();
    const users = await UserState.find().lean();

    const missingRooms = rooms.filter((room) => {
      return !users.some((u) => {
        if (!u?.lastReportedRoom || !u?.lastReportAt) return false;
        if (u.lastReportedRoom !== room.name) return false;
        return zonedDateKey(u.lastReportAt, timeZone) === todayKey;
      });
    });

    const missingNames = missingRooms.map((r) => r.name);
    const missingUsers = users.filter((u) => {
      if (!u?.userId || !u?.lastReportedRoom) return false;
      if (!missingNames.includes(u.lastReportedRoom)) return false;
      return zonedDateKey(u.lastReportAt, timeZone) !== todayKey;
    });

    const groupText =
      missingNames.length === 0
        ? '✅ Имрӯз ҳамаи комнатаҳо ҳисобот супориданд.'
        : `⏰ Соат 22:00.\n📋 Ҳисобот супорида нашуд:\n${missingNames
            .map((n) => `- ${n}`)
            .join('\n')}`;

    await bot.telegram.sendMessage(groupId, groupText);

    for (const user of missingUsers) {
      const lang = normalizeLang(user.language);
      const personal = t(lang, 'dailySummaryReminder', {
        room: user.lastReportedRoom,
      });
      try {
        await bot.telegram.sendMessage(user.userId, personal);
      } catch (err) {
        log.warn('Failed to send daily summary reminder to user', {
          userId: user.userId,
          error: err?.message,
        });
      }
    }

    await BotState.findOneAndUpdate(
      { key: BOT_STATE_KEY },
      { $set: { key: BOT_STATE_KEY, value: todayKey } },
      { upsert: true, new: true }
    );

    log.info('Daily 22:00 summary sent', {
      timeZone,
      todayKey,
      missingRooms: missingNames.length,
      remindedUsers: missingUsers.length,
    });
  };

  const timer = setInterval(() => {
    run().catch((err) => log.error('Daily summary tick failed', { err }));
  }, CHECK_EVERY_MS);
  timer.unref?.();
  run().catch((err) => log.error('Initial daily summary run failed', { err }));
  log.info('Daily summary scheduler started', { timeZone, hour, checkEveryMs: CHECK_EVERY_MS });
  return timer;
}

module.exports = { startDailySummaryJob };
