const ActivityLog = require('../models/ActivityLog');

async function logActivity({ actor, action, details = {}, ip = '' }) {
  await ActivityLog.create({ actor, action, details, ip });
}

module.exports = { logActivity };
