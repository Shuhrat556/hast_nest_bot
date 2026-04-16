const mongoose = require('mongoose');
const { getLogger } = require('../utils/logger');

/**
 * Connect to MongoDB. Call once at process startup (after `initLogger`).
 * @returns {Promise<typeof mongoose>}
 */
async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  const log = getLogger();

  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => {
    log.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (err) => {
    log.error('MongoDB connection error', { err });
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
  } catch (err) {
    log.error('MongoDB connection failed', { err });
    throw err;
  }

  log.info('MongoDB connected', { host: mongoose.connection.host });
  return mongoose;
}

module.exports = { connectDb };
