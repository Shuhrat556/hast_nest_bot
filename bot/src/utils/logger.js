const winston = require('winston');

/** @type {winston.Logger | null} */
let rootLogger = null;

/**
 * @param {object} env — validated env from `loadEnv()`
 */
function initLogger(env) {
  const isProd = env.NODE_ENV === 'production';

  const consoleFormat = isProd
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaStr =
            Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] ${stack || message}${metaStr}`;
        })
      );

  rootLogger = winston.createLogger({
    level: env.LOG_LEVEL,
    defaultMeta: { service: 'room-bot' },
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
        format: consoleFormat,
      }),
    ],
  });

  return rootLogger;
}

/**
 * @returns {winston.Logger}
 */
function getLogger() {
  if (!rootLogger) {
    return winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console({ format: winston.format.simple() })],
    });
  }
  return rootLogger;
}

module.exports = { initLogger, getLogger };
