/**
 * `K 3` -> `3`, otherwise keeps source.
 * @param {string} room
 * @returns {string}
 */
function toShortRoom(room) {
  const raw = String(room || '').trim();
  const m = raw.match(/(\d+)/);
  return m ? m[1] : raw;
}

/**
 * @param {{ room: string, count: number, max: number, lang?: string }} p
 */
function formatFullReport(p) {
  const roomShort = toShortRoom(p.room);
  return `ID ${p.reportId}\nБот ${roomShort} - и код ${p.max}\nҲамааш тайёр`;
}

/**
 * @param {{ room: string, count: number, max: number, missing: number, reason: string, lang?: string }} p
 */
function formatPartialReport(p) {
  const roomShort = toShortRoom(p.room);
  return (
    `ID ${p.reportId}\n` +
    `Бот ${roomShort} - и код ${p.max}\n` +
    `${p.missing} код тайёр нест\n` +
    `Сабаб: ${p.reason}`
  );
}

module.exports = {
  formatFullReport,
  formatPartialReport,
};
