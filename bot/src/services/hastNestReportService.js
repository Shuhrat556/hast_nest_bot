const BotState = require('../models/BotState');
const HastNestReport = require('../models/HastNestReport');

const REPORT_SEQ_KEY = 'hast_nest_report_seq';

async function getNextReportId() {
  const seqDoc = await BotState.findOneAndUpdate(
    { key: REPORT_SEQ_KEY },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const seq = Number(seqDoc?.value || 1);
  return `HN-${String(seq).padStart(6, '0')}`;
}

/**
 * @param {{
 *   userId: number,
 *   roomId?: number | null,
 *   room: string,
 *   count: number,
 *   max: number,
 *   missing: number,
 *   reason?: string | null,
 *   lang?: 'en'|'ru'|'tj',
 *   kind: 'full'|'partial',
 * }} payload
 */
async function createHastNestReport(payload) {
  const reportId = await getNextReportId();
  await HastNestReport.create({
    reportId,
    ...payload,
  });
  return reportId;
}

module.exports = {
  createHastNestReport,
};
