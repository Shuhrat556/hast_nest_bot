require('dotenv').config();

let env;
try {
  // eslint-disable-next-line global-require
  const { loadEnv } = require('./config/env');
  env = loadEnv();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  // Logger not initialized yet
  // eslint-disable-next-line no-console
  console.error('Invalid configuration:', msg);
  process.exit(1);
}

const { initLogger, getLogger } = require('./utils/logger');
initLogger(env);

const http = require('http');
const { Telegraf } = require('telegraf');
const { connectDb } = require('./config/db');
const { registerStart } = require('./handlers/start');
const { registerCallbacks } = require('./handlers/callbacks');
const { registerReason } = require('./handlers/reason');
const { registerAdmin } = require('./handlers/admin');
const { ensureDefaultRooms } = require('./services/roomSeedService');
const { replyWithError } = require('./utils/handlerErrors');

function maybeBindHealthServer() {
  const port = env.PORT;
  if (!port) {
    return null;
  }
  const log = getLogger();
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok');
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, () => {
    log.info(`Health server listening on port ${port} (/health)`);
  });
  return server;
}

async function main() {
  const log = getLogger();

  process.on('unhandledRejection', (reason) => {
    log.error('Unhandled promise rejection', { reason });
  });
  process.on('uncaughtException', (error) => {
    log.error('Uncaught exception', { err: error });
    process.exit(1);
  });

  await connectDb();
  await ensureDefaultRooms();
  maybeBindHealthServer();

  const bot = new Telegraf(env.BOT_TOKEN);

  bot.catch((err, ctx) => {
    log.error('Unhandled bot error', {
      err,
      updateType: ctx?.updateType,
      userId: ctx?.from?.id,
    });
    replyWithError(ctx, err, {
      context: 'bot.catch',
      defaultUserMessage: 'An unexpected error occurred. Try /start again.',
    }).catch(() => {});
  });

  registerStart(bot);
  registerCallbacks(bot, { groupId: env.GROUP_ID });
  registerAdmin(bot, { adminId: env.ADMIN_ID });
  registerReason(bot, { groupId: env.GROUP_ID });

  log.info('Starting bot (long polling)…');
  await bot.launch();
  log.info('Bot is running');

  const shutdown = async (signal) => {
    log.info(`Received ${signal}; stopping…`);
    bot.stop(signal);
    try {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
      log.info('MongoDB disconnected');
    } catch (e) {
      log.warn('mongoose.disconnect failed', { err: e });
    }
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  getLogger().error('Fatal startup error', { err });
  process.exit(1);
});
