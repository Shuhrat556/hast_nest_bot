const { Markup } = require('telegraf');
const { t } = require('./i18n');

const CALLBACK = {
  langPrefix: 'lang:',
  roomPrefix: 'room:',
  countPrefix: 'cnt:',
  reasonPrefix: 'rsn:',
};

function mainReplyKeyboard() {
  return Markup.keyboard([['/start', '/language']])
    .resize()
    .persistent();
}

function removeReplyKeyboard() {
  return Markup.removeKeyboard();
}

function languageInlineKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇷🇺 Русский', `${CALLBACK.langPrefix}ru`),
      Markup.button.callback('🇹🇯 Тоҷикӣ', `${CALLBACK.langPrefix}tj`),
    ],
    [Markup.button.callback('🇬🇧 English', `${CALLBACK.langPrefix}en`)],
  ]);
}

/**
 * @param {Array<{ _id: import('mongoose').Types.ObjectId, name: string }>} rooms
 */
function roomsInlineKeyboard(rooms) {
  const buttons = rooms.map((r) =>
    Markup.button.callback(
      `🏠 ${r.name}  •  👥 ${r.capacity}`,
      `${CALLBACK.roomPrefix}${r._id.toString()}`
    )
  );
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  return Markup.inlineKeyboard(rows);
}

/**
 * Buttons from max down to 0 (inclusive).
 * @param {number} max
 */
function countInlineKeyboard(max) {
  const safeMax = Math.max(0, Math.floor(Number(max)) || 0);
  const row = [];
  for (let n = safeMax; n >= 0; n -= 1) {
    let label = `👤 ${n}`;
    if (n === safeMax) label = `✅ ${n}`;
    if (n === 0) label = '⭕ 0';
    row.push(Markup.button.callback(label, `${CALLBACK.countPrefix}${n}`));
  }
  /** @type {import('telegraf/typings/markup').InlineKeyboardButton[][]} */
  const rows = [];
  const chunk = 4;
  for (let i = 0; i < row.length; i += chunk) {
    rows.push(row.slice(i, i + chunk));
  }
  return Markup.inlineKeyboard(rows);
}

/**
 * @param {'en'|'ru'|'tj'} lang
 */
function reasonInlineKeyboard(lang) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `🚶 ${t(lang, 'reasonPresetOutside')}`,
        `${CALLBACK.reasonPrefix}outside`
      ),
    ],
    [
      Markup.button.callback(
        `🤒 ${t(lang, 'reasonPresetSick')}`,
        `${CALLBACK.reasonPrefix}sick`
      ),
    ],
    [
      Markup.button.callback(
        `❔ ${t(lang, 'reasonPresetNoReason')}`,
        `${CALLBACK.reasonPrefix}no_reason`
      ),
    ],
    [
      Markup.button.callback(
        `✍️ ${t(lang, 'reasonPresetCustom')}`,
        `${CALLBACK.reasonPrefix}custom`
      ),
    ],
  ]);
}

module.exports = {
  CALLBACK,
  mainReplyKeyboard,
  removeReplyKeyboard,
  languageInlineKeyboard,
  roomsInlineKeyboard,
  countInlineKeyboard,
  reasonInlineKeyboard,
};
