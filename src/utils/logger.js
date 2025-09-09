const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const envLevel = (() => {
  const raw = process.env.LOG_LEVEL && String(process.env.LOG_LEVEL).toLowerCase();
  if (raw && raw in LEVELS) return raw;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
})();

const current = LEVELS[envLevel] ?? LEVELS.info;

function ts() {
  return new Date().toISOString();
}

function out(lvl, scope, ...args) {
  const msg = `[${ts()}] [${lvl.toUpperCase()}]${scope ? ' [' + scope + ']' : ''}`;
  const printer = lvl === 'error' ? console.error : lvl === 'warn' ? console.warn : console.log;
  printer(msg, ...args);
}

module.exports = {
  level: envLevel,
  isEnabled: (lvl) => (LEVELS[lvl] ?? LEVELS.info) <= current,
  error: (scope, ...args) => out('error', scope, ...args),
  warn: (scope, ...args) => {
    if ((LEVELS.warn) <= current) out('warn', scope, ...args);
  },
  info: (scope, ...args) => {
    if ((LEVELS.info) <= current) out('info', scope, ...args);
  },
  debug: (scope, ...args) => {
    if ((LEVELS.debug) <= current) out('debug', scope, ...args);
  },
};
