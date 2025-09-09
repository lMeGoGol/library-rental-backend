const { createError } = require('../utils/errors');

exports.validate = (schema, source = 'body') => (req, res, next) => {
  const data = req[source] || {};
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues?.[0];
    const msg = first ? `${first.path?.join('.')}: ${first.message}` : 'Validation error';
    return next(createError(400, 'VALIDATION_ERROR', msg));
  }
  req[source] = result.data;
  next();
};
