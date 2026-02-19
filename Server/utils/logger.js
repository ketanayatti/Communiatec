/**
 * Structured Logger (Winston)
 * ───────────────────────────
 * - Respects LOG_LEVEL from env (defaults: debug in dev, info in prod)
 * - Writes error.log + combined.log to Server/logs/
 * - Console transport uses colorized output in development
 * - JSON format in file transports for machine parsing
 */

const winston = require('winston');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// ── Custom levels ─────────────────────────────────────────────────────
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(colors);

// ── Log directory ─────────────────────────────────────────────────────
const logDir = path.join(__dirname, '..', 'logs');

// ── Formats ───────────────────────────────────────────────────────────
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Transports ────────────────────────────────────────────────────────
const transports = [
  // Console — always active
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // error.log — errors only
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5 * 1024 * 1024, // 5 MB rotation
    maxFiles: 5,
  }),

  // combined.log — all levels up to LOG_LEVEL
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10 MB rotation
    maxFiles: 5,
  }),
];

// ── Create logger ─────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  transports,
  // Don't exit on handled errors
  exitOnError: false,
});

// ── HTTP request logger middleware ────────────────────────────────────
// Only active when ENABLE_REQUEST_LOGGING=true (default in dev)
const requestLoggingEnabled =
  process.env.ENABLE_REQUEST_LOGGING === 'true' ||
  (!isProduction && process.env.ENABLE_REQUEST_LOGGING !== 'false');

const httpLogMiddleware = (req, res, next) => {
  if (!requestLoggingEnabled) return next();

  // Skip noisy health/keepalive/userInfo endpoints
  const skipPaths = ['/api/health', '/api/keepalive', '/api/auth/userInfo', '/api/maintenance/status'];
  if (skipPaths.some((p) => req.originalUrl.startsWith(p))) return next();

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
};

module.exports = logger;
module.exports.httpLogMiddleware = httpLogMiddleware;
