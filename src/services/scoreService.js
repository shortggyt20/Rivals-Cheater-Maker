const Report = require('../models/Report');

function classifyScore(score) {
  if (score < 30) return { label: 'Clean', color: 'green' };
  if (score < 60) return { label: 'Suspicious', color: 'yellow' };
  return { label: 'Likely Cheater', color: 'red' };
}

async function calculateCheaterScore(targetRobloxId) {
  const reports = await Report.find({ targetRobloxId, status: 'approved' });
  if (!reports.length) {
    return { score: 0, ...classifyScore(0), reportsCount: 0 };
  }

  const weighted = reports.reduce((acc, report) => {
    const base = report.classification === 'likely_cheater' ? 1 : report.classification === 'suspicious' ? 0.6 : 0.1;
    return acc + base * report.moderatorWeight;
  }, 0);

  const normalization = reports.length * 2;
  const score = Math.min(100, Math.round((weighted / normalization) * 100));
  return {
    score,
    ...classifyScore(score),
    reportsCount: reports.length
  };
}

module.exports = {
  calculateCheaterScore,
  classifyScore
};
