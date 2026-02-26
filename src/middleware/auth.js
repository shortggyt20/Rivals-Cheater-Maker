const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function attachUser(req, res, next) {
  const token = req.cookies?.authToken;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user && user.role !== 'banned') {
      req.user = user;
      res.locals.currentUser = user;
    }
  } catch (_err) {
    res.clearCookie('authToken');
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).render('auth/login', { error: 'Login required.' });
  if (req.user.role === 'shadow') req.isShadowBanned = true;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  return next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
