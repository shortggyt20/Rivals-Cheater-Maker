const crypto = require('crypto');
const express = require('express');
const Report = require('../models/Report');
const { reportLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const { reportValidation } = require('../middleware/validators');
const { logActivity } = require('../services/logService');

const router = express.Router();

function fingerprintRequest(req) {
  const source = `${req.ip}:${req.get('user-agent') || 'unknown-agent'}`;
  return crypto.createHash('sha256').update(source).digest('hex');
}

router.post('/', reportLimiter, upload.single('evidence'), reportValidation, async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Evidence file is required.');
  }

  try {
    await Report.create({
      ...req.body,
      reporterFingerprint: fingerprintRequest(req),
      evidencePath: `/uploads/${req.file.filename}`,
      evidenceMimeType: req.file.mimetype
    });
    await logActivity({ action: 'report_submitted', details: req.body, ip: req.ip });
    return res.redirect(`/u/${req.body.targetUsername}`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send('Duplicate report detected from this device/IP.');
    }
    return res.status(500).send('Failed to submit report.');
  }
});

module.exports = router;
