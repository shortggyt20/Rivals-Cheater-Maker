const express = require('express');
const Report = require('../models/Report');
const { requireAuth } = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const { reportValidation } = require('../middleware/validators');
const { refreshTrustScore } = require('../services/scoreService');
const { logActivity } = require('../services/logService');

const router = express.Router();

router.post('/', requireAuth, reportLimiter, upload.single('evidence'), reportValidation, async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Evidence file is required.');
  }

  if (req.user.accountAgeDays < 14) {
    return res.status(403).send('Your Roblox account must be at least 14 days old to submit reports.');
  }

  if (req.user.role === 'shadow' || req.isShadowBanned) {
    await logActivity({ actor: req.user._id, action: 'shadow_report_blocked', details: req.body, ip: req.ip });
    return res.redirect(`/u/${req.body.targetUsername}`);
  }

  try {
    await Report.create({
      ...req.body,
      reporter: req.user._id,
      evidencePath: `/uploads/${req.file.filename}`,
      evidenceMimeType: req.file.mimetype
    });
    await refreshTrustScore(req.user._id);
    await logActivity({ actor: req.user._id, action: 'report_submitted', details: req.body, ip: req.ip });
    return res.redirect(`/u/${req.body.targetUsername}`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send('Duplicate report detected.');
    }
    return res.status(500).send('Failed to submit report.');
  }
});

module.exports = router;
