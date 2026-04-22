const Room = require('../models/Room');
const { getLogger } = require('../utils/logger');
const { canonicalRoomName } = require('./roomService');

async function cleanupRoomData() {
  let renamed = 0;
  let removedDuplicates = 0;
  let normalizedIds = 0;
  let fixedCapacities = 0;

  const allRooms = await Room.find().sort({ createdAt: 1, roomId: 1, name: 1 });
  const canonicalBuckets = new Map();
  for (const room of allRooms) {
    const key = canonicalRoomName(room.name).toLowerCase();
    const current = canonicalBuckets.get(key) || [];
    current.push(room);
    canonicalBuckets.set(key, current);
  }

  for (const bucket of canonicalBuckets.values()) {
    if (!bucket.length) continue;
    const canonicalName = canonicalRoomName(bucket[0].name);
    let keeper = bucket.find((r) => r.name === canonicalName) || bucket[0];

    const bestCapacity = Math.max(
      0,
      ...bucket.map((r) => (Number.isFinite(r.capacity) ? r.capacity : 0))
    );

    if (keeper.name !== canonicalName) {
      keeper.name = canonicalName;
      renamed += 1;
    }
    if (keeper.capacity !== bestCapacity) {
      keeper.capacity = bestCapacity;
      fixedCapacities += 1;
    }
    await keeper.save();

    for (const duplicate of bucket) {
      if (String(duplicate._id) === String(keeper._id)) continue;
      await Room.deleteOne({ _id: duplicate._id });
      removedDuplicates += 1;
    }
  }

  const remaining = await Room.find().sort({ roomId: 1, name: 1, createdAt: 1 });
  const used = new Set();
  let nextId = 1;

  for (const room of remaining) {
    let targetId = Number.isFinite(room.roomId) && room.roomId > 0 ? room.roomId : null;
    if (!targetId || used.has(targetId)) {
      while (used.has(nextId)) nextId += 1;
      targetId = nextId;
      nextId += 1;
    }

    if (room.roomId !== targetId) {
      room.roomId = targetId;
      await room.save();
      normalizedIds += 1;
    }
    used.add(targetId);
  }

  return {
    renamed,
    removedDuplicates,
    normalizedIds,
    fixedCapacities,
    totalRooms: remaining.length,
  };
}

async function ensureDefaultRooms() {
  const log = getLogger();
  const result = await cleanupRoomData();
  log.info('Room data cleanup completed', {
    ...result,
  });
}

module.exports = { ensureDefaultRooms, cleanupRoomData };
