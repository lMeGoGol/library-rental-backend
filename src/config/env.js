// Lightweight environment validation / normalization
const REQUIRED = ['MONGO_URI','JWT_SECRET'];

function readEnv() {
  const errors = [];
  for (const key of REQUIRED) {
    if (!process.env[key]) errors.push(`Missing ${key}`);
  }
  const MAX_ACTIVE_LOANS = Number(process.env.MAX_ACTIVE_LOANS || 5);
  if (Number.isNaN(MAX_ACTIVE_LOANS) || MAX_ACTIVE_LOANS < 1) errors.push('MAX_ACTIVE_LOANS must be positive');
  const MAX_RENEWS = Number(process.env.MAX_RENEWS || 2);
  if (Number.isNaN(MAX_RENEWS) || MAX_RENEWS < 0) errors.push('MAX_RENEWS must be >= 0');
  if (errors.length) {
    // Fail fast – misconfigured environment
    console.error('[env] Invalid configuration:\n' + errors.map(e => ' - ' + e).join('\n'));
    process.exit(1);
  }
  return {
    PORT: Number(process.env.PORT || 5000),
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    MAX_ACTIVE_LOANS,
    MAX_RENEWS,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 300),
  };
}

module.exports = readEnv();
