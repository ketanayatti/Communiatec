// ═══════════════════════════════════════════════════════════════════════
// Communiatec Server — Production-Ready Entry Point
// ═══════════════════════════════════════════════════════════════════════
//
// Boot order:
//   1. Load & validate environment (fail-fast on missing critical vars)
//   2. Initialise Express + security middleware
//   3. Mount API routes
//   4. Create HTTP server & Socket.io
//   5. Connect database (fail-fast in production)
//   6. Listen
//
// ═══════════════════════════════════════════════════════════════════════

// ── 1. Environment — MUST be first ───────────────────────────────────
const { NODE_ENV, isProduction, isDevelopment, PORT } = require('./config/env');

// ── 2. Core dependencies ─────────────────────────────────────────────
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ── Internal modules ──────────────────────────────────────────────────
const logger = require('./utils/logger');
const { httpLogMiddleware } = require('./utils/logger');
const dbConnect = require('./config/database');
const Setting = require('./models/SettingModel');

// Routes
const AuthRoute = require('./routes/AuthRoute');
const ContactRoutes = require('./routes/ContactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoute = require('./routes/profileRoute');
const adminRoutes = require('./routes/adminRoutes');
const codeRoutes = require('./routes/codeRoutes');
const groupRoutes = require('./routes/groupRoutes');

// Socket handlers
const setupChatSocket = require('./socket');
const handleCodeCollaboration = require('./socket-handlers/codeSocket');
const handleGroupSocket = require('./socket-handlers/groupSocket');

// Middleware
const maintenanceMiddleware = require('./middlewares/MaintenanceMiddleware');
const {
  xssProtection,
  mongoSanitize,
  hpp,
  authLimiter,
  validateInput,
  securityHeaders,
} = require('./middlewares/securityMiddleware');
const {
  securityAuditMiddleware,
  checkSessionSecurity,
} = require('./middlewares/securityAudit');

// ═══════════════════════════════════════════════════════════════════════
// EXPRESS APP
// ═══════════════════════════════════════════════════════════════════════
const app = express();

// Trust first proxy (Render, Nginx, etc.)
app.set('trust proxy', 1);

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── HTTP request logging ──────────────────────────────────────────────
app.use(httpLogMiddleware);

// ═══════════════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

let allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

//  FAIL-FAST: In production, CORS origins MUST be explicitly configured
if (isProduction && allowedOrigins.length === 0) {
  logger.error('');
  logger.error('══════════════════════════════════════════════════════');
  logger.error('  ❌ FATAL: CORS_ALLOWED_ORIGINS is empty in production');
  logger.error('  Set it to your client domain(s), comma-separated.');
  logger.error('══════════════════════════════════════════════════════');
  process.exit(1);
}

// Development fallback (never in production)
if (!isProduction && allowedOrigins.length === 0) {
  allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.SERVER_URL,
  ].filter(Boolean);
  if (allowedOrigins.length === 0) {
    logger.error('❌ No CORS origins configured. Set CORS_ALLOWED_ORIGINS in your .env.development file.');
    process.exit(1);
  }
  logger.warn('⚠️  CORS_ALLOWED_ORIGINS not set — falling back to CLIENT_URL/SERVER_URL:', { origins: allowedOrigins });
}

// Allow Vercel preview deployments
const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || 'true') === 'true';

logger.info('🔍 CORS Configuration:', {
  origins: allowedOrigins,
  allowVercelPreviews,
  environment: NODE_ENV,
});

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (curl, mobile apps)
  if (allowedOrigins.includes(origin)) return true;
  if (allowVercelPreviews && /https?:\/\/[a-z0-9-]+\.[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    logger.warn('🚫 CORS blocked:', { origin });
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Cookie',
    'Origin',
  ],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Manual CORS headers for reliability (especially error responses)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0] || process.env.CLIENT_URL);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Cookie, Set-Cookie, Origin'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// ═══════════════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by custom securityHeaders
    crossOriginEmbedderPolicy: false,
  })
);

app.use(mongoSanitize());
app.use(hpp());
app.use(xssProtection);
app.use(validateInput);
app.use(securityHeaders);
app.use(securityAuditMiddleware);

// ── Rate limiting ─────────────────────────────────────────────────────
const generalApiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skip: (req) =>
    req.method === 'OPTIONS' ||
    req.originalUrl.startsWith('/api/maintenance/status') ||
    req.originalUrl.startsWith('/api/auth/userInfo') ||
    req.originalUrl.startsWith('/api/health') ||
    req.originalUrl.startsWith('/api/keepalive'),
  message: { error: 'API rate limit exceeded', retryAfter: 15 * 60 },
});

app.use('/api', generalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/github', authLimiter);
app.use('/api/auth/linkedin', authLimiter);

// ── Static files ──────────────────────────────────────────────────────
app.use(
  '/uploads/profile-images',
  express.static(path.join(__dirname, 'uploads/profile-images'))
);

// ═══════════════════════════════════════════════════════════════════════
// PRE-ROUTE ENDPOINTS (bypass maintenance)
// ═══════════════════════════════════════════════════════════════════════

// Maintenance status
app.get('/api/maintenance/status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        maintenanceMode: false,
        timestamp: new Date().toISOString(),
        server: 'online',
        warning: 'database_disconnected',
      });
    }
    const settings = await Setting.findOne();
    res.json({
      maintenanceMode: settings?.maintenanceMode || false,
      timestamp: new Date().toISOString(),
      server: 'online',
    });
  } catch (err) {
    logger.error('Error fetching maintenance status:', { error: err.message });
    res.json({
      maintenanceMode: false,
      timestamp: new Date().toISOString(),
      server: 'online',
    });
  }
});

// Keepalive
app.get('/api/keepalive', (req, res) => {
  logger.debug('Keepalive ping received');
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    server: 'Communiatec Backend',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    services: {
      database: dbStatus[dbState] || 'unknown',
      redis: require('./utils/redisClient').isReady ? 'connected' : 'in-memory-fallback',
      code_collaboration: 'enabled',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// MAINTENANCE MIDDLEWARE + API ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.use('/api', maintenanceMiddleware);

app.use('/api/auth', AuthRoute);
app.use('/api', checkSessionSecurity, profileRoute);
app.use('/api/contact', ContactRoutes);
app.use('/api/message', checkSessionSecurity, messageRoutes);
app.use('/api/admin', checkSessionSecurity, adminRoutes);
app.use('/api/code', checkSessionSecurity, codeRoutes);
app.use('/api/groups', checkSessionSecurity, groupRoutes);
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/message-suggestions', require('./routes/messageSuggestionRoutes'));
app.use('/api/ai-suggestions', require('./routes/aiSuggestionRoutes'));
app.use('/api/zoro', require('./routes/zoroRoutes'));

// ═══════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  logger.error('Server Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════════════════
// HTTP SERVER + SOCKET.IO
// ═══════════════════════════════════════════════════════════════════════

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false,
  serveClient: false,
  allowEIO3: true,
});

// Global references for controllers
global.io = io;
app.set('io', io);

io.engine.on('connection_error', (err) => {
  logger.error('Socket.io connection error:', {
    message: err.message,
    type: err.type,
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SOCKET INITIALIZATION — SINGLE io.on("connection") HANDLER
// ═══════════════════════════════════════════════════════════════════════
//
// BEFORE (3 separate io.on("connection") — race conditions & duplicate maps):
//   1. setupSocket(io)   → own userSocketMap + io.on("connection")
//   2. server.js L387    → second userSocketMap + io.on("connection") + groupSocket
//   3. server.js L421    → third io.on("connection") for logging
//
// AFTER (unified):
//   - setupChatSocket handles its own namespace internally (DM, reactions, typing)
//   - We register ONE connection handler for group + monitoring
//   - Code collaboration uses its own /code namespace (no conflict)

// 1) Chat socket (DMs, reactions, read receipts) — registers its own io.on("connection")
setupChatSocket(io);

// 2) Code collaboration — isolated /code namespace
try {
  handleCodeCollaboration(io);
  logger.info('✅ Code collaboration socket initialized on /code namespace');
} catch (error) {
  logger.error('❌ Failed to initialize code collaboration:', { error: error.message });
  if (isProduction) process.exit(1);
}

// 3) Group chat — piggyback on the chat socket's connection
//    NOTE: setupChatSocket (socket.js) already creates its own userSocketMap.
//    We reuse io.userSocketMap set by socket.js instead of creating a duplicate.

// Wait for socket.js to register, then add group handlers
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // Use the userSocketMap from socket.js (set as io.userSocketMap)
  const userSocketMap = io.userSocketMap || global.chatUserSocketMap || new Map();
  global.userSocketMap = userSocketMap;
  app.set('userSocketMap', userSocketMap);

  // Group socket handler
  handleGroupSocket(io, socket, userSocketMap);

  // Connection logging (debug level — suppressed in production)
  logger.debug(`👤 Client connected: ${socket.id}`, {
    userId: userId || 'anonymous',
    ip: socket.handshake.address,
  });

  socket.on('disconnect', (reason) => {
    logger.debug(`👋 Client disconnected: ${socket.id}`, { reason });
  });

  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, { error: error.message });
  });
});

logger.info('✅ All socket handlers initialized');

// ═══════════════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════════════

const startServer = async () => {
  // Database — fail-fast in production (handled inside dbConnect)
  await dbConnect();

  server.listen(PORT, () => {
    const serverHost = process.env.SERVER_URL || `http://0.0.0.0:${PORT}`;

    logger.info('═'.repeat(50));
    logger.info('🚀 Communiatec Server Started!');
    logger.info(`📡 Server     : ${serverHost}`);
    logger.info(`🌍 Environment: ${NODE_ENV}`);
    logger.info(`🔌 Port       : ${PORT}`);
    logger.info(`📝 Log level  : ${process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')}`);
    logger.info('═'.repeat(50));

    // Keepalive self-ping for Render free tier (production only)
    if (isProduction && process.env.SERVER_URL) {
      const keepAliveInterval = setInterval(() => {
        http
          .get(`${process.env.SERVER_URL}/api/keepalive`, (res) => {
            res.resume();
            if (res.statusCode === 200) {
              logger.debug('Keepalive ping successful');
            }
          })
          .on('error', (err) => {
            logger.warn('Keepalive ping failed:', { error: err.message });
          });
      }, 10 * 60 * 1000); // 10 minutes

      // Cleanup on shutdown
      const clearKeepAlive = () => clearInterval(keepAliveInterval);
      process.on('SIGTERM', clearKeepAlive);
      process.on('SIGINT', clearKeepAlive);
    }
  });

  // Handle port-in-use error (fail-fast)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ FATAL: Port ${PORT} is already in use.`);
      process.exit(1);
    }
    throw err;
  });
};

startServer();

// ═══════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════

const gracefulShutdown = (signal) => {
  logger.info(`📤 ${signal} received — shutting down gracefully...`);

  server.close(() => {
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      logger.info('✅ Database connection closed.');
      logger.info('✅ Server shut down cleanly.');
      process.exit(0);
    });
  });

  // Force kill after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('⚠️  Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Unhandled errors ──────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('🚨 Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('🚨 Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('uncaughtException');
});

module.exports = app;
