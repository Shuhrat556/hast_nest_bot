const { clearFlow, getUserState } = require('../utils/userState');
const { sendPartialAttendanceReport } = require('../services/reportService');
const { replyWithError } = require('../utils/handlerErrors');
const { normalizeLang, t } = require('../utils/i18n');

/**
 * @param {import('telegraf').Telegraf} bot
 * @param {{ groupId: string }} deps
 */
function registerReason(bot, deps) {
  const { groupId } = deps;

  bot.on('text', async (ctx, next) => {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        return next();
      }

      const text = ctx.message.text;
      if (typeof text !== 'string') {
        return next();
      }

      if (text.startsWith('/')) {
        return next();
      }

      const state = await getUserState(userId);
      if (!state || state.step !== 'await_reason') {
        return next();
      }

      const lang = normalizeLang(state.language);
      const reason = text.trim();
      if (!reason) {
        await ctx.reply(t(lang, 'reasonEmpty')).catch(() => {});
        return;
      }
      if (reason.length > 4000) {
        await ctx.reply(t(lang, 'reasonTooLong')).catch(() => {});
        return;
      }

      const room = state.room;
      const count = state.count ?? 0;
      const max = state.max ?? 0;
      const missing = state.missing ?? Math.max(0, max - count);

      try {
        await sendPartialAttendanceReport(ctx.telegram, groupId, {
          room,
          count,
          max,
          missing,
          reason,
          lang,
        });
      } catch (err) {
        await clearFlow(userId);
        throw err;
      }

      await clearFlow(userId);

      await ctx.reply(t(lang, 'reportSentPartial')).catch(() => {});
    } catch (err) {
      await replyWithError(ctx, err, { context: 'reason' });
    }
  });
}

module.exports = { registerReason };
