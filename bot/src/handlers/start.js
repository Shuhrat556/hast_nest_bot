const Room = require('../models/Room');
const {
  languageInlineKeyboard,
  mainReplyKeyboard,
  roomsInlineKeyboard,
} = require('../utils/keyboards');
const { getUserState, upsertUserState } = require('../utils/userState');
const { replyWithError } = require('../utils/handlerErrors');
const { normalizeLang, t } = require('../utils/i18n');

/**
 * @param {import('telegraf').Telegraf} bot
 */
function registerStart(bot) {
  bot.start(async (ctx) => {
    try {
      await showStartFlow(ctx);
    } catch (err) {
      await replyWithError(ctx, err, { context: 'start' });
    }
  });

  bot.command('language', async (ctx) => {
    try {
      const userId = ctx.from?.id;
      if (!userId) return;
      await upsertUserState(userId, { step: 'choose_language' });
      await ctx.reply('Menu:', mainReplyKeyboard());
      await ctx.reply(t('en', 'chooseLanguage'), languageInlineKeyboard());
    } catch (err) {
      await replyWithError(ctx, err, { context: 'language_command' });
    }
  });
}

/**
 * @param {import('telegraf').Context} ctx
 */
async function showStartFlow(ctx) {
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
    await ctx.reply('Menu:', mainReplyKeyboard());
    await ctx.reply(t('en', 'chooseLanguage'), languageInlineKeyboard());
    return;
  }

  const rooms = await Room.find().sort({ roomId: 1, name: 1 }).lean();

  if (!rooms.length) {
    await upsertUserState(userId, { step: 'idle' });
    await ctx.reply(t(lang, 'noRooms'), mainReplyKeyboard());
    return;
  }

  await upsertUserState(userId, { step: 'choose_room' });

  await ctx.reply('Menu:', mainReplyKeyboard());
  await ctx.reply(t(lang, 'selectRoom'), roomsInlineKeyboard(rooms));
}

module.exports = { registerStart };
