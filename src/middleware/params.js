const mongoose = require('mongoose');
const { createError } = require('../utils/errors');

function validateObjectIdParam(name = 'id') {
  return (req, res, next) => {
    const value = req.params[name];
    if (value !== 'me' && !mongoose.Types.ObjectId.isValid(value)) {
  try { require('../utils/logger').error('params', `Invalid ${name} value: ${value} on ${req.method} ${req.originalUrl}`); } catch(_) {}
      return next(createError(400, 'INVALID_ID', `Invalid ${name}`));
    }
    next();
  };
}

module.exports = { validateObjectIdParam };
