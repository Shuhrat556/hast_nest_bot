const { AppError } = require('../errors/AppError');
const { getLogger } = require('./logger');

const DEFAULT_USER_MSG =
  'Something went wrong. Please try /start again.';

/**
 * Map errors to user-visible replies and structured logs.
 * @param {import('telegraf').Context} ctx
 * @param {unknown} err
 * @param {{ context?: string; defaultUserMessage?: string }} [opts]
 */
async function replyWithError(ctx, err, opts = {}) {
  const log = getLogger();
  const context = opts.context || 'handler';
  const defaultUserMessage = opts.defaultUserMessage || DEFAULT_USER_MSG;

  if (!ctx || typeof ctx.reply !== 'function') {
    log.error(`${context}: cannot reply (no context)`, { err });
    return;
  }

  if (err instanceof AppError) {
    log.warn(`${context}: operational error`, {
      code: err.code,
      message: err.message,
      userId: ctx.from?.id,
    });
    const text = err.userMessage ?? err.message;
    if (ctx.callbackQuery) {
      const toast = text.length > 200 ? `${text.slice(0, 197)}…` : text;
      await ctx.answerCbQuery(toast).catch(() => {});
    }
    await ctx.reply?.(text).catch(() => {});
    return;
  }

  log.error(`${context}: unexpected error`, {
    err,
    userId: ctx.from?.id,
  });

  if (ctx.callbackQuery) {
    await ctx.answerCbQuery('Error — try /start').catch(() => {});
  }
  await ctx.reply?.(defaultUserMessage).catch(() => {});
}

module.exports = { replyWithError, DEFAULT_USER_MSG };
