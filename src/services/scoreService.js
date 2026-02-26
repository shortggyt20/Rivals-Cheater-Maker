const Report = require('../models/Report');
const User = require('../models/User');

function classifyScore(score) {
  if (score < 30) return { label: 'Clean', color: 'green' };
  if (score < 60) return { label: 'Suspicious', color: 'yellow' };
  return { label: 'Likely Cheater', color: 'red' };
}

async function calculateCheaterScore(targetRobloxId) {
  const reports = await Report.find({ targetRobloxId, status: 'approved' }).populate('reporter');
  if (!reports.length) {
    return { score: 0, ...classifyScore(0), reportsCount: 0 };
  }

  const weighted = reports.reduce((acc, report) => {
    const reporterTrust = report.reporter?.trustScore ?? 0.5;
    const base = report.classification === 'likely_cheater' ? 1 : report.classification === 'suspicious' ? 0.6 : 0.1;
    return acc + base * reporterTrust * report.moderatorWeight;
  }, 0);

  const normalization = reports.length * 2;
  const score = Math.min(100, Math.round((weighted / normalization) * 100));
  return {
    score,
    ...classifyScore(score),
    reportsCount: reports.length
  };
}

async function computeReporterTrust(userId) {
  const reports = await Report.find({ reporter: userId });
  if (!reports.length) return 0.5;
  const approved = reports.filter((r) => r.status === 'approved').length;
  const rejected = reports.filter((r) => r.status === 'rejected').length;
  const raw = approved / (approved + rejected + 1);
  return Math.max(0.05, Math.min(1, Number(raw.toFixed(2))));
}

async function refreshTrustScore(userId) {
  const trustScore = await computeReporterTrust(userId);
  await User.findByIdAndUpdate(userId, { trustScore });
  return trustScore;
}

module.exports = {
  calculateCheaterScore,
  refreshTrustScore,
  classifyScore
};
