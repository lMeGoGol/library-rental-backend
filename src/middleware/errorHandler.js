const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  const message = err.message || 'Server error';
  const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'ERROR');

  if (logger.isEnabled('debug') && err.stack) logger.error('error', status, code, message, err.stack);
  else logger.error('error', status, code, message);

  res.status(status).json({ error: { message, code } });
};
