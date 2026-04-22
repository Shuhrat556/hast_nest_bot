const Room = require('../models/Room');
const { getLogger } = require('../utils/logger');
const { assignMissingRoomIds } = require('./roomIdService');

const DEFAULT_ROOMS = [
  { roomId: 1, name: 'K 1', capacity: 6, legacyNames: ['Komnata 1'] },
  { roomId: 2, name: 'K 2', capacity: 8, legacyNames: ['Komnata 2'] },
  { roomId: 3, name: 'K 3', capacity: 6, legacyNames: ['Komnata 3'] },
  { roomId: 4, name: 'K 4', capacity: 10, legacyNames: ['Komnata 4'] },
  { roomId: 5, name: 'K 5', capacity: 4, legacyNames: ['Komnata 5'] },
  { roomId: 6, name: 'K 6', capacity: 8, legacyNames: ['Komnata 6'] },
  { roomId: 7, name: 'K 7', capacity: 6, legacyNames: ['Komnata 7'] },
  { roomId: 8, name: 'K 8', capacity: 10, legacyNames: ['Komnata 8'] },
  { roomId: 9, name: "Ma'muriyat", capacity: 10 },
];

async function migrateLegacyRoomNames() {
  let renamed = 0;
  let removedDuplicates = 0;
  let syncedDefaultIds = 0;

  for (const room of DEFAULT_ROOMS) {
    const currentRoom = await Room.findOne({ name: room.name });
    if (currentRoom && currentRoom.roomId !== room.roomId) {
      currentRoom.roomId = room.roomId;
      await currentRoom.save();
      syncedDefaultIds += 1;
    }

    for (const legacyName of room.legacyNames || []) {
      const legacyRoom = await Room.findOne({ name: legacyName });
      if (!legacyRoom) {
        continue;
      }

      const targetRoom = await Room.findOne({ name: room.name });
      if (!targetRoom) {
        legacyRoom.name = room.name;
        legacyRoom.roomId = room.roomId;
        await legacyRoom.save();
        renamed += 1;
        continue;
      }

      await Room.deleteOne({ _id: legacyRoom._id });
      removedDuplicates += 1;
    }
  }

  return { renamed, removedDuplicates, syncedDefaultIds };
}

async function ensureDefaultRooms() {
  const log = getLogger();
  const migration = await migrateLegacyRoomNames();
  const ops = DEFAULT_ROOMS.map(({ roomId, name, capacity }) => ({
    updateOne: {
      filter: { name },
      update: { $setOnInsert: { roomId, name, capacity } },
      upsert: true,
    },
  }));

  const result = await Room.bulkWrite(ops, { ordered: false });
  const upserted = result.upsertedCount || 0;
  const assignedMissingIds = await assignMissingRoomIds(DEFAULT_ROOMS.length + 1);
  log.info('Default rooms seed completed', {
    totalConfigured: DEFAULT_ROOMS.length,
    inserted: upserted,
    renamedLegacyRooms: migration.renamed,
    removedLegacyDuplicates: migration.removedDuplicates,
    syncedDefaultIds: migration.syncedDefaultIds,
    assignedMissingIds,
  });
}

module.exports = { DEFAULT_ROOMS, ensureDefaultRooms };
