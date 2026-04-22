const Room = require('../models/Room');
const { getLogger } = require('../utils/logger');
const { replyWithError } = require('../utils/handlerErrors');
const {
  parseAddRoomCommand,
  formatZodError,
} = require('../validation/schemas');
const { getNextRoomId } = require('../services/roomIdService');
const {
  adminBroadcastInlineKeyboard,
  mainReplyKeyboard,
} = require('../utils/keyboards');
const { FLOW_STEPS } = require('../domain/flowSteps');
const {
  clearFlow,
  getUserState,
  upsertUserState,
} = require('../utils/userState');
const { broadcastToKnownUsers } = require('../services/broadcastService');
const { cleanupRoomData } = require('../services/roomSeedService');

function parseSetRoomCommand(messageText) {
  const raw = typeof messageText === 'string' ? messageText : '';
  const rest = raw.replace(/^\/setroom(?:@\w+)?\s*/i, '').trim();
  const parts = rest.split(/\s+/);
  if (parts.length < 3) {
    return {
      success: false,
      message: 'Usage: /setroom <id> <name> <capacity>\nExample: /setroom 10 Lab 12',
    };
  }
  const id = Number(parts[0]);
  const capacity = Number(parts[parts.length - 1]);
  const name = parts.slice(1, -1).join(' ').trim();

  if (!Number.isInteger(id) || id < 1) {
    return { success: false, message: 'Room id must be a positive integer.' };
  }
  if (!name) {
    return { success: false, message: 'Room name is required.' };
  }
  if (!Number.isInteger(capacity) || capacity < 0) {
    return { success: false, message: 'Capacity must be a non-negative integer.' };
  }
  return { success: true, data: { id, name, capacity } };
}

function parseDeleteRoomCommand(messageText) {
  const raw = typeof messageText === 'string' ? messageText : '';
  const rest = raw.replace(/^\/delroom(?:@\w+)?\s*/i, '').trim();
  const id = Number(rest);
  if (!Number.isInteger(id) || id < 1) {
    return { success: false, message: 'Usage: /delroom <id>\nExample: /delroom 4' };
  }
  return { success: true, id };
}
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

      const roomId = await getNextRoomId();
      await Room.create({
        roomId,
        name: parsed.data.name,
        capacity: parsed.data.capacity,
      });

      getLogger().info('Room created', {
        roomId,
        name: parsed.data.name,
        capacity: parsed.data.capacity,
        adminId: uid,
      });

      await ctx.reply(
        `Room added: #${roomId} ${parsed.data.name} (capacity ${parsed.data.capacity})`
      );
    } catch (err) {
      if (err && err.code === 11000) {
        await ctx.reply('A room with that name or id already exists.').catch(() => {});
        return;
      }
      await replyWithError(ctx, err, { context: 'addroom' });
    }
  });

  bot.command('rooms', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      const rooms = await Room.find().sort({ roomId: 1, name: 1 }).lean();
      if (!rooms.length) {
        await ctx.reply("Rooms bo'sh. /setroom bilan to'ldiring.");
        return;
      }

      const lines = rooms.map((r) => `#${r.roomId} | ${r.name} | 👥 ${r.capacity}`);
      await ctx.reply(`📋 Rooms:\n${lines.join('\n')}`);
    } catch (err) {
      await replyWithError(ctx, err, { context: 'rooms_command' });
    }
  });

  bot.command('setroom', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      const parsed = parseSetRoomCommand(ctx.message?.text);
      if (!parsed.success) {
        await ctx.reply(parsed.message);
        return;
      }

      const { id, name, capacity } = parsed.data;
      const sameName = await Room.findOne({ name });
      if (sameName && sameName.roomId !== id) {
        await ctx.reply(`Room name "${name}" already exists as #${sameName.roomId}.`);
        return;
      }

      await Room.findOneAndUpdate(
        { roomId: id },
        { $set: { roomId: id, name, capacity } },
        { upsert: true, new: true, runValidators: true }
      );
      await ctx.reply(`✅ Saved: #${id} ${name} (capacity ${capacity})`);
    } catch (err) {
      if (err && err.code === 11000) {
        await ctx.reply('Duplicate room id/name. Try another id or name.');
        return;
      }
      await replyWithError(ctx, err, { context: 'setroom' });
    }
  });

  bot.command('delroom', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      const parsed = parseDeleteRoomCommand(ctx.message?.text);
      if (!parsed.success) {
        await ctx.reply(parsed.message);
        return;
      }

      const result = await Room.deleteOne({ roomId: parsed.id });
      if (!result.deletedCount) {
        await ctx.reply(`Room #${parsed.id} topilmadi.`);
        return;
      }
      await ctx.reply(`🗑️ Room #${parsed.id} o'chirildi.`);
    } catch (err) {
      await replyWithError(ctx, err, { context: 'delroom' });
    }
  });

  bot.command('cleandata', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      const result = await cleanupRoomData();
      await ctx.reply(
        `🧹 Data cleaned.\nRenamed: ${result.renamed}\nRemoved duplicates: ${result.removedDuplicates}\nNormalized IDs: ${result.normalizedIds}\nFixed capacities: ${result.fixedCapacities}\nTotal rooms: ${result.totalRooms}`
      );
    } catch (err) {
      await replyWithError(ctx, err, { context: 'cleandata' });
    }
  });

  bot.command('broadcast', async (ctx) => {
    try {
      const uid = ctx.from?.id;
      if (!uid || uid !== adminId) {
        await ctx.reply('You are not authorized to use this command.');
        return;
      }

      await upsertUserState(uid, {
        step: FLOW_STEPS.ADMIN_BROADCAST_WAIT_TEXT,
      });

      await ctx.reply(
        "📣 Broadcast panel\n\n1) 'Yuborishni boshlash' ni bosing.\n2) Keyin bitta xabar yozing.\n3) Xabar /start bosgan hamma userlarga yuboriladi.",
        {
          ...adminBroadcastInlineKeyboard(),
        }
      );
    } catch (err) {
      await replyWithError(ctx, err, { context: 'broadcast_command' });
    }
  });

  bot.on('text', async (ctx, next) => {
    try {
      const uid = ctx.from?.id;
      const text = ctx.message?.text;
      if (!uid || uid !== adminId || typeof text !== 'string' || text.startsWith('/')) {
        return next();
      }

      const state = await getUserState(uid);
      if (!state || state.step !== FLOW_STEPS.ADMIN_BROADCAST_WAIT_TEXT) {
        return next();
      }

      const message = text.trim();
      if (!message) {
        await ctx.reply("Xabar bo'sh bo'lmasin.");
        return;
      }

      const result = await broadcastToKnownUsers(ctx.telegram, `📢 Admin xabari:\n\n${message}`);
      await clearFlow(uid);
      await ctx.reply(
        `✅ Broadcast yakunlandi.\nJami: ${result.total}\nYuborildi: ${result.sent}\nXatolik: ${result.failed}`,
        mainReplyKeyboard(true)
      );
    } catch (err) {
      await replyWithError(ctx, err, { context: 'broadcast_text' });
    }
  });
}

module.exports = { registerAdmin };
