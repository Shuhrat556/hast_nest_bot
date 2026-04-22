const Room = require('../models/Room');

async function getNextRoomId(startFrom = 1) {
  const lastRoom = await Room.findOne({
    roomId: { $exists: true, $ne: null },
  })
    .sort({ roomId: -1 })
    .select({ roomId: 1 })
    .lean();

  return Math.max(startFrom, (lastRoom?.roomId || 0) + 1);
}

async function assignMissingRoomIds(startFrom = 1) {
  const rooms = await Room.find({
    $or: [{ roomId: { $exists: false } }, { roomId: null }],
  }).sort({ createdAt: 1, name: 1 });

  if (!rooms.length) {
    return 0;
  }

  let nextRoomId = await getNextRoomId(startFrom);
  for (const room of rooms) {
    room.roomId = nextRoomId;
    await room.save();
    nextRoomId += 1;
  }

  return rooms.length;
}

module.exports = {
  getNextRoomId,
  assignMissingRoomIds,
};
