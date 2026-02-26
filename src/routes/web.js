const express = require('express');
const Report = require('../models/Report');
const Appeal = require('../models/Appeal');
const { calculateCheaterScore } = require('../services/scoreService');
const { getUserByUsername, computeAccountAgeDays, getPreviousUsernames } = require('../services/robloxService');
const { lookupValidation, appealValidation, handleValidation } = require('../middleware/validators');
const { requireAuth } = require('../middleware/auth');
const { logActivity } = require('../services/logService');

const router = express.Router();

router.get('/', async (req, res) => {
  const leaderboard = await Report.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$targetRobloxId', targetUsername: { $first: '$targetUsername' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.render('index', { error: null, result: null, leaderboard, reports: [] });
});

router.get('/u/:username', lookupValidation, handleValidation, async (req, res) => {
  const robloxUser = await getUserByUsername(req.params.username);
  if (!robloxUser) {
    return res.status(404).render('index', { error: 'User not found.', result: null, leaderboard: [], reports: [] });
  }

  const previousUsernames = await getPreviousUsernames(robloxUser.id);
  const scoreData = await calculateCheaterScore(robloxUser.id);
  const reports = await Report.find({ targetRobloxId: robloxUser.id, status: 'approved' })
    .populate('reporter', 'username avatarUrl trustScore')
    .sort({ createdAt: -1 })
    .limit(20);

  const result = {
    ...robloxUser,
    previousUsernames,
    accountAgeDays: computeAccountAgeDays(robloxUser.created),
    scoreData
  };

  return res.render('profile', { result, reports, error: null });
});

router.post('/appeals', requireAuth, appealValidation, async (req, res) => {
  await Appeal.create(req.body);
  await logActivity({ actor: req.user._id, action: 'appeal_submitted', details: req.body, ip: req.ip });
  return res.redirect('/?appeal=received');
});

module.exports = router;
