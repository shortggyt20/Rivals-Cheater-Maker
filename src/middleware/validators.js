const { body, param, validationResult } = require('express-validator');

const lookupValidation = [
  param('username').isString().trim().isLength({ min: 3, max: 20 }).matches(/^[A-Za-z0-9_]+$/)
];

const reportValidation = [
  body('targetRobloxId').isString().trim().notEmpty(),
  body('targetUsername').isString().trim().isLength({ min: 3, max: 20 }),
  body('classification').isIn(['clean', 'suspicious', 'likely_cheater']),
  body('reason').isString().trim().isLength({ min: 8, max: 160 }),
  body('description').isString().trim().isLength({ min: 15, max: 1000 })
];

const appealValidation = [
  body('targetRobloxId').isString().trim().notEmpty(),
  body('contact').isString().trim().isLength({ min: 5, max: 120 }),
  body('message').isString().trim().isLength({ min: 15, max: 1500 })
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).render('index', {
    error: errors.array().map((e) => e.msg).join(', '),
    result: null,
    leaderboard: [],
    reports: []
  });
}

module.exports = {
  lookupValidation,
  reportValidation,
  appealValidation,
  handleValidation
};
