const {
  languageInlineKeyboard,
  mainReplyKeyboard,
  roomsInlineKeyboard,
} = require('../utils/keyboards');
const { getUserState, upsertUserState } = require('../utils/userState');
const { replyWithError } = require('../utils/handlerErrors');
const { normalizeLang, t } = require('../utils/i18n');
const { getRoomsForSelection } = require('../services/roomService');
const { FLOW_STEPS } = require('../domain/flowSteps');

/**
 * @param {import('telegraf').Telegraf} bot
 * @param {{ adminId: number }} deps
 */
function registerStart(bot, deps) {
  const { adminId } = deps;
  bot.start(async (ctx) => {
    try {
      await showStartFlow(ctx, adminId);
    } catch (err) {
      await replyWithError(ctx, err, { context: 'start' });
    }
  });

  bot.command('language', async (ctx) => {
    try {
      const userId = ctx.from?.id;
      if (!userId) return;
      await upsertUserState(userId, { step: FLOW_STEPS.CHOOSE_LANGUAGE });
      await ctx.reply('Menu:', mainReplyKeyboard(userId === adminId));
      await ctx.reply(t('en', 'chooseLanguage'), languageInlineKeyboard());
    } catch (err) {
      await replyWithError(ctx, err, { context: 'language_command' });
    }
  });
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {number} adminId
 */
async function showStartFlow(ctx, adminId) {
  const userId = ctx.from?.id;
  if (!userId) {
    return;
  }

  const currentState = await getUserState(userId);
  const lang = normalizeLang(currentState?.language);

  if (!currentState?.language) {
    await upsertUserState(userId, {
      step: FLOW_STEPS.CHOOSE_LANGUAGE,
      language: null,
    });
    await ctx.reply('Menu:', mainReplyKeyboard(userId === adminId));
    await ctx.reply(t('en', 'chooseLanguage'), languageInlineKeyboard());
    return;
  }

  const rooms = await getRoomsForSelection();

  if (!rooms.length) {
    await upsertUserState(userId, { step: FLOW_STEPS.IDLE });
    await ctx.reply(t(lang, 'noRooms'), mainReplyKeyboard(userId === adminId));
    return;
  }

  await upsertUserState(userId, { step: FLOW_STEPS.CHOOSE_ROOM });

  await ctx.reply('Menu:', mainReplyKeyboard(userId === adminId));
  await ctx.reply(t(lang, 'selectRoom'), roomsInlineKeyboard(rooms));
}

module.exports = { registerStart };
