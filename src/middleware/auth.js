function attachUser(_req, res, next) {
  res.locals.currentUser = null;
  return next();
}

function requireAuth(_req, _res, next) {
  return next();
}

function requireAdmin(req, res, next) {
  const adminKey = req.get('x-admin-key') || req.query.adminKey;
  if (!process.env.ADMIN_PANEL_KEY || adminKey !== process.env.ADMIN_PANEL_KEY) {
    return res.status(403).send('Forbidden');
  }
  return next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
