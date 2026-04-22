const Room = require('../models/Room');

function canonicalRoomName(name) {
  const raw = String(name || '').trim();
  const match = raw.match(/^k(?:omnata)?\s*(\d+)$/i);
  if (!match) return raw;
  return `K ${Number(match[1])}`;
}

/**
 * Returns a deduplicated room list optimized for UI menus.
 * Legacy names like "Komnata 1" are merged into "K 1".
 */
async function getRoomsForSelection() {
  const rooms = await Room.find().sort({ roomId: 1, name: 1 }).lean();
  const dedup = new Map();

  for (const room of rooms) {
    const canonicalName = canonicalRoomName(room.name);
    const key = canonicalName.toLowerCase();
    const existing = dedup.get(key);

    if (!existing) {
      dedup.set(key, {
        ...room,
        name: canonicalName,
      });
      continue;
    }

    const existingHasCanonical = existing.name === canonicalRoomName(existing.name);
    const incomingHasCanonical = room.name === canonicalName;
    const incomingHasLowerId =
      typeof room.roomId === 'number' &&
      (typeof existing.roomId !== 'number' || room.roomId < existing.roomId);

    if ((incomingHasCanonical && !existingHasCanonical) || incomingHasLowerId) {
      dedup.set(key, {
        ...room,
        name: canonicalName,
      });
    }
  }

  return Array.from(dedup.values()).sort((a, b) => {
    const aid = Number.isFinite(a.roomId) ? a.roomId : Number.MAX_SAFE_INTEGER;
    const bid = Number.isFinite(b.roomId) ? b.roomId : Number.MAX_SAFE_INTEGER;
    if (aid !== bid) return aid - bid;
    return String(a.name).localeCompare(String(b.name));
  });
}

module.exports = {
  canonicalRoomName,
  getRoomsForSelection,
};
