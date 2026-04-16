const Room = require('../models/Room');
const { languageInlineKeyboard, roomsInlineKeyboard } = require('../utils/keyboards');
const { getUserState, upsertUserState } = require('../utils/userState');
const { replyWithError } = require('../utils/handlerErrors');
const { normalizeLang, t } = require('../utils/i18n');

/**
 * @param {import('telegraf').Telegraf} bot
 */
function registerStart(bot) {
  bot.start(async (ctx) => {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        return;
      }

      const currentState = await getUserState(userId);
      const lang = normalizeLang(currentState?.language);

      if (!currentState?.language) {
        await upsertUserState(userId, {
          step: 'choose_language',
          language: null,
        });
        await ctx.reply(t('en', 'chooseLanguage'), languageInlineKeyboard());
        return;
      }

      const rooms = await Room.find().sort({ name: 1 }).lean();

      if (!rooms.length) {
        await upsertUserState(userId, { step: 'idle' });
        await ctx.reply(t(lang, 'noRooms'));
        return;
      }

      await upsertUserState(userId, { step: 'choose_room' });

      await ctx.reply(t(lang, 'selectRoom'), roomsInlineKeyboard(rooms));
    } catch (err) {
      await replyWithError(ctx, err, { context: 'start' });
    }
  });
}

module.exports = { registerStart };
