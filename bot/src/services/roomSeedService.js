const Room = require('../models/Room');
const { getLogger } = require('../utils/logger');

const DEFAULT_ROOMS = [
  { name: 'Komnata 1', capacity: 6 },
  { name: 'Komnata 2', capacity: 8 },
  { name: 'Komnata 3', capacity: 6 },
  { name: 'Komnata 4', capacity: 10 },
  { name: 'Komnata 5', capacity: 4 },
  { name: 'Komnata 6', capacity: 8 },
  { name: 'Komnata 7', capacity: 6 },
  { name: 'Komnata 8', capacity: 10 },
  { name: "Ma'muriyat", capacity: 10 },
];

async function ensureDefaultRooms() {
  const log = getLogger();
  const ops = DEFAULT_ROOMS.map((room) => ({
    updateOne: {
      filter: { name: room.name },
      update: { $setOnInsert: room },
      upsert: true,
    },
  }));

  const result = await Room.bulkWrite(ops, { ordered: false });
  const upserted = result.upsertedCount || 0;
  log.info('Default rooms seed completed', {
    totalConfigured: DEFAULT_ROOMS.length,
    inserted: upserted,
  });
}

module.exports = { DEFAULT_ROOMS, ensureDefaultRooms };
