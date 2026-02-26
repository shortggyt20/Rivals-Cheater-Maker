const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many reports from this IP. Try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { globalLimiter, reportLimiter };
