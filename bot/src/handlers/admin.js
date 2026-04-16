const Room = require('../models/Room');
const { getLogger } = require('../utils/logger');
const { replyWithError } = require('../utils/handlerErrors');
const {
  parseAddRoomCommand,
  formatZodError,
} = require('../validation/schemas');
/**
 * @param {import('telegraf').Telegraf} bot
 * @param {{ adminId: number }} deps
 */
function registerAdmin(bot, deps) {
  const { adminId } = deps;

  bot.command('addroom', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      const parsed = parseAddRoomCommand(ctx.message?.text);
      if (!parsed.success) {
        if (parsed.error) {
          await ctx.reply(formatZodError(parsed.error));
        } else {
          await ctx.reply(parsed.message);
        }
        return;
      }

      await Room.create({
        name: parsed.data.name,
        capacity: parsed.data.capacity,
      });

      getLogger().info('Room created', {
        name: parsed.data.name,
        capacity: parsed.data.capacity,
        adminId: uid,
      });

      await ctx.reply(
        `Room added: ${parsed.data.name} (capacity ${parsed.data.capacity})`
      );
    } catch (err) {
      if (err && err.code === 11000) {
        await ctx.reply('A room with that name already exists.').catch(() => {});
        return;
      }
      await replyWithError(ctx, err, { context: 'addroom' });
    }
  });
}

module.exports = { registerAdmin };
