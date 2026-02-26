const express = require('express');
const { body } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { requireAdmin } = require('../middleware/auth');
const { logActivity } = require('../services/logService');

const router = express.Router();

router.use(requireAdmin);

router.get('/', async (_req, res) => {
  const reports = await Report.find().populate('reporter reviewedBy', 'username role trustScore').sort({ createdAt: -1 }).limit(200);
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
  const users = await User.find().sort({ createdAt: -1 }).limit(100);
  res.render('admin/dashboard', { reports, logs, users });
});

router.post('/reports/:id/review', body('decision').isIn(['approved', 'rejected', 'removed']), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).send('Not found');

  report.status = req.body.decision;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.moderationNote = req.body.moderationNote || '';
  if (req.body.moderatorWeight) report.moderatorWeight = Number(req.body.moderatorWeight);
  await report.save();

  await logActivity({ actor: req.user._id, action: 'report_reviewed', details: { reportId: report.id, decision: req.body.decision }, ip: req.ip });
  return res.redirect('/admin');
});

router.post('/users/:id/ban', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: req.body.shadow ? 'shadow' : 'banned' });
  await logActivity({ actor: req.user._id, action: 'user_banned', details: { userId: req.params.id, shadow: Boolean(req.body.shadow) }, ip: req.ip });
  res.redirect('/admin');
});

module.exports = router;
