const express = require('express');
const Report = require('../models/Report');
const { calculateCheaterScore } = require('../services/scoreService');

const router = express.Router();

router.get('/v1/reputation/:robloxId', async (req, res) => {
  const score = await calculateCheaterScore(req.params.robloxId);
  const latestReports = await Report.find({ targetRobloxId: req.params.robloxId, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('classification reason createdAt evidencePath');

  res.json({
    robloxId: req.params.robloxId,
    ...score,
    latestReports
  });
});

module.exports = router;
