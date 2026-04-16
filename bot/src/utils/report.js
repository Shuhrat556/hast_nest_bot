const { t } = require('./i18n');

/**
 * @param {{ room: string, count: number, max: number, lang?: string }} p
 */
function formatFullReport(p) {
  const lang = p.lang || 'en';
  return (
    `📋 ${t(lang, 'reportTitle')}\n` +
    `🏠 ${t(lang, 'reportRoom')}: ${p.room}\n` +
    `👥 ${t(lang, 'reportPresent')}: ${p.count}/${p.max}\n` +
    `✅ ${t(lang, 'reportAllPresent')}`
  );
}

/**
 * @param {{ room: string, count: number, max: number, missing: number, reason: string, lang?: string }} p
 */
function formatPartialReport(p) {
  const lang = p.lang || 'en';
  return (
    `📋 ${t(lang, 'reportTitle')}\n` +
    `🏠 ${t(lang, 'reportRoom')}: ${p.room}\n` +
    `👥 ${t(lang, 'reportPresent')}: ${p.count}/${p.max}\n` +
    `❌ ${t(lang, 'reportMissing')}: ${p.missing}\n` +
    `📌 ${t(lang, 'reportReason')}: ${p.reason}`
  );
}

module.exports = {
  formatFullReport,
  formatPartialReport,
};
