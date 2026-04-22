const Room = require('../models/Room');
const {
  CALLBACK,
  adminBroadcastInlineKeyboard,
  countInlineKeyboard,
  mainReplyKeyboard,
  reasonInlineKeyboard,
  roomsInlineKeyboard,
} = require('../utils/keyboards');
const {
  upsertUserState,
  clearFlow,
  getUserState,
  markReportSubmitted,
} = require('../utils/userState');
const {
  sendFullAttendanceReport,
  sendPartialAttendanceReport,
} = require('../services/reportService');
const { getLogger } = require('../utils/logger');
const { replyWithError } = require('../utils/handlerErrors');
const { SUPPORTED_LANGS, normalizeLang, t } = require('../utils/i18n');
const {
  roomIdCallbackSchema,
  countCallbackSchema,
} = require('../validation/schemas');
const { AppError } = require('../errors/AppError');
const { VALIDATION } = require('../errors/codes');
const { canonicalRoomName, getRoomsForSelection } = require('../services/roomService');
const { FLOW_STEPS } = require('../domain/flowSteps');

/**
 * @param {import('telegraf').Telegraf} bot
 * @param {{ groupId: string, adminId: number }} deps
 */
function registerCallbacks(bot, deps) {
  const { groupId, adminId } = deps;

  bot.on('callback_query', async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      const userId = ctx.from?.id;
      if (!userId || typeof data !== 'string') {
        await ctx.answerCbQuery().catch(() => {});
        return;
      }

      if (data.startsWith(CALLBACK.roomPrefix)) {
        await handleRoomSelect(ctx, userId, data);
        return;
      }

      if (data.startsWith(CALLBACK.langPrefix)) {
        await handleLanguageSelect(ctx, userId, data);
        return;
      }

      if (data.startsWith(CALLBACK.countPrefix)) {
        await handleCountSelect(ctx, userId, data, groupId, adminId);
        return;
      }

      if (data.startsWith(CALLBACK.reasonPrefix)) {
        await handleReasonSelect(ctx, userId, data, groupId, adminId);
        return;
      }

      if (data === CALLBACK.adminBroadcastStart) {
        await handleAdminBroadcastStart(ctx, userId, adminId);
        return;
      }

      if (data === CALLBACK.adminBroadcastCancel) {
        await handleAdminBroadcastCancel(ctx, userId, adminId);
        return;
      }

      const state = await getUserState(userId);
      const lang = normalizeLang(state?.language);
      await ctx.answerCbQuery(t(lang, 'unknownAction')).catch(() => {});
    } catch (err) {
      await replyWithError(ctx, err, { context: 'callback_query' });
    }
  });
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {number} userId
 * @param {string} data
 */
async function handleLanguageSelect(ctx, userId, data) {
  const langCode = data.slice(CALLBACK.langPrefix.length);
  if (!SUPPORTED_LANGS.includes(langCode)) {
    await ctx.answerCbQuery('Invalid language').catch(() => {});
    return;
  }

  await upsertUserState(userId, {
    language: langCode,
    step: FLOW_STEPS.CHOOSE_ROOM,
    room: null,
    roomId: null,
    max: null,
    count: null,
    missing: null,
  });

  const rooms = await getRoomsForSelection();
  await ctx.answerCbQuery().catch(() => {});

  if (!rooms.length) {
    await upsertUserState(userId, { step: FLOW_STEPS.IDLE });
    try {
      await ctx.editMessageText(`${t(langCode, 'languageSet')}\n\n${t(langCode, 'noRooms')}`);
    } catch (_) {
      await ctx.reply(`${t(langCode, 'languageSet')}\n\n${t(langCode, 'noRooms')}`);
    }
    return;
  }

  const text = `${t(langCode, 'languageSet')}\n\n${t(langCode, 'selectRoom')}`;
  try {
    await ctx.editMessageText(text, roomsInlineKeyboard(rooms));
  } catch (_) {
    await ctx.reply(text, roomsInlineKeyboard(rooms));
  }
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {number} userId
 * @param {string} data
 */
async function handleRoomSelect(ctx, userId, data) {
  const log = getLogger();
  const state = await getUserState(userId);
  const lang = normalizeLang(state?.language);
  const roomIdStr = data.slice(CALLBACK.roomPrefix.length);
  const roomIdParsed = roomIdCallbackSchema.safeParse(roomIdStr);
  if (!roomIdParsed.success) {
    await ctx.answerCbQuery(t(lang, 'invalidRoom')).catch(() => {});
    return;
  }

  const room = await Room.findOne({ roomId: roomIdParsed.data }).lean();
  if (!room) {
    await ctx.answerCbQuery(t(lang, 'roomNotFound')).catch(() => {});
    return;
  }

  await upsertUserState(userId, {
    step: FLOW_STEPS.CHOOSE_COUNT,
    language: lang,
    roomId: room.roomId,
    room: canonicalRoomName(room.name),
    max: room.capacity,
    count: null,
    missing: null,
  });

  await ctx.answerCbQuery().catch(() => {});

  const text = t(lang, 'roomSelected', {
    room: canonicalRoomName(room.name),
    max: room.capacity,
  });
  try {
    await ctx.editMessageText(text, {
      ...countInlineKeyboard(room.capacity),
    });
  } catch (e) {
    log.warn('editMessageText failed after room select; sending new message', {
      message: e?.message,
      userId,
    });
    await ctx.reply(text, {
      ...countInlineKeyboard(room.capacity),
    });
  }
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {number} userId
 * @param {string} data
 * @param {string} groupId
 * @param {number} adminId
 */
async function handleCountSelect(ctx, userId, data, groupId, adminId) {
  const log = getLogger();
  const state = await getUserState(userId);
  const lang = normalizeLang(state?.language);
  if (!state || state.step !== FLOW_STEPS.CHOOSE_COUNT) {
    await ctx.answerCbQuery(t(lang, 'tapStart')).catch(() => {});
    return;
  }

  const nStr = data.slice(CALLBACK.countPrefix.length);
  const countParsed = countCallbackSchema.safeParse(nStr);
  if (!countParsed.success) {
    await ctx.answerCbQuery(t(lang, 'invalidCount')).catch(() => {});
    return;
  }
  const count = countParsed.data;

  const max = state.max ?? 0;
  if (count > max) {
    await ctx.answerCbQuery(t(lang, 'countTooHigh')).catch(() => {});
    return;
  }

  const missing = max - count;

  await upsertUserState(userId, {
    step: missing === 0 ? FLOW_STEPS.IDLE : FLOW_STEPS.AWAIT_REASON,
    language: lang,
    count,
    missing,
  });

  await ctx.answerCbQuery().catch(() => {});

  if (!groupId) {
    log.error('GROUP_ID is empty; cannot send report');
    throw new AppError('GROUP_ID not configured', {
      code: VALIDATION,
      userMessage:
        'Report could not be sent (server misconfiguration).',
    });
  }

  if (missing === 0) {
    try {
      await sendFullAttendanceReport(ctx.telegram, groupId, {
        userId,
        roomId: state.roomId,
        room: state.room,
        count,
        max,
        lang,
      });
      await markReportSubmitted(userId, state.room);
    } catch (err) {
      await clearFlow(userId);
      throw err;
    }

    try {
      await ctx.editMessageText(t(lang, 'reportSentFull'), {
        reply_markup: { inline_keyboard: [] },
      });
    } catch (e) {
      await ctx.reply(t(lang, 'reportSentFull'), mainReplyKeyboard(userId === adminId)).catch(() => {});
    }

    await clearFlow(userId);
    return;
  }

  const text = t(lang, 'askReason', {
    room: state.room,
    count,
    max,
    missing,
  });
  const reasonHint = `\n\n${t(lang, 'askReasonPreset')}`;

  try {
    await ctx.editMessageText(`${text}${reasonHint}`, {
      ...reasonInlineKeyboard(lang),
    });
  } catch (e) {
    await ctx.reply(`${text}${reasonHint}`, reasonInlineKeyboard(lang)).catch(() => {});
  }
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {number} userId
 * @param {string} data
 * @param {string} groupId
 * @param {number} adminId
 */
async function handleReasonSelect(ctx, userId, data, groupId, adminId) {
  const state = await getUserState(userId);
  const lang = normalizeLang(state?.language);
  if (!state || state.step !== FLOW_STEPS.AWAIT_REASON) {
    await ctx.answerCbQuery(t(lang, 'tapStart')).catch(() => {});
    return;
  }

  const key = data.slice(CALLBACK.reasonPrefix.length);
  if (!['outside', 'sick', 'no_reason', 'custom'].includes(key)) {
    await ctx.answerCbQuery(t(lang, 'unknownAction')).catch(() => {});
    return;
  }

  if (key === 'custom') {
    await ctx.answerCbQuery().catch(() => {});
    const msg = t(lang, 'reasonManualPrompt');
    try {
      await ctx.editMessageText(msg, { reply_markup: { inline_keyboard: [] } });
    } catch (_) {
      await ctx.reply(msg).catch(() => {});
    }
    return;
  }

  const reasonMap = {
    outside: t(lang, 'reasonPresetOutsideReport'),
    sick: t(lang, 'reasonPresetSick'),
    no_reason: t(lang, 'reasonPresetNoReasonReport'),
  };
  const reason = reasonMap[key];

  try {
    await sendPartialAttendanceReport(ctx.telegram, groupId, {
      userId,
      roomId: state.roomId,
      room: state.room,
      count: state.count ?? 0,
      max: state.max ?? 0,
      missing: state.missing ?? 0,
      reason,
      lang,
    });
    await markReportSubmitted(userId, state.room);
  } catch (err) {
    await clearFlow(userId);
    throw err;
  }

  await clearFlow(userId);
  await ctx.answerCbQuery().catch(() => {});
  try {
    await ctx.editMessageText(t(lang, 'reportSentPartial'), {
      reply_markup: { inline_keyboard: [] },
    });
  } catch (_) {
    await ctx.reply(t(lang, 'reportSentPartial'), mainReplyKeyboard(userId === adminId)).catch(() => {});
  }
}

async function handleAdminBroadcastStart(ctx, userId, adminId) {
  if (userId !== adminId) {
    await ctx.answerCbQuery('Not allowed').catch(() => {});
    return;
  }
  await upsertUserState(userId, {
    step: FLOW_STEPS.ADMIN_BROADCAST_WAIT_TEXT,
  });
  await ctx.answerCbQuery().catch(() => {});
  try {
    await ctx.editMessageText(
      "📣 Broadcast mode yoqildi.\n\nBitta xabar yozing - botni /start qilgan hamma foydalanuvchilarga yuboraman.",
      {
        ...adminBroadcastInlineKeyboard(),
      }
    );
  } catch (_) {
    await ctx.reply(
      "📣 Broadcast mode yoqildi.\n\nBitta xabar yozing - botni /start qilgan hamma foydalanuvchilarga yuboraman.",
      {
        ...adminBroadcastInlineKeyboard(),
      }
    );
  }
}

async function handleAdminBroadcastCancel(ctx, userId, adminId) {
  if (userId !== adminId) {
    await ctx.answerCbQuery('Not allowed').catch(() => {});
    return;
  }
  await clearFlow(userId);
  await ctx.answerCbQuery('Bekor qilindi').catch(() => {});
  try {
    await ctx.editMessageText('Broadcast bekor qilindi.');
  } catch (_) {
    await ctx.reply('Broadcast bekor qilindi.', mainReplyKeyboard(true));
  }
}

module.exports = { registerCallbacks };
