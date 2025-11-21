const express = require("express");
const dbConnect = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// ✨ FIXED: Import all routes and socket handlers
const codeRoutes = require("./routes/codeRoutes");
const handleCodeCollaboration = require("./socket-handlers/codeSocket");
const handleGroupSocket = require("./socket-handlers/groupSocket");
const AuthRoute = require("./routes/AuthRoute");
const ContactRoutes = require("./routes/ContactRoutes");
const messageRoutes = require("./routes/messageRoutes");
const profileRoute = require("./routes/profileRoute");
const adminRoutes = require("./routes/adminRoutes");
const setupSocket = require("./socket");
const groupRoutes = require("./routes/groupRoutes");
const Setting = require("./models/SettingModel"); // Import Setting model for maintenance status

require("dotenv").config();

const app = express();

// Behind Render/other proxies, trust the first proxy so req.ip reflects the real client
app.set("trust proxy", 1);

// 🛠️ Global maintenance mode middleware (must be before API routes)
const maintenanceMiddleware = require("./middlewares/MaintenanceMiddleware");
// ✨ ENHANCED SECURITY: Comprehensive security middleware setup
const helmet = require("helmet");
const {
  xssProtection,
  mongoSanitize,
  hpp,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  validateInput,
  securityHeaders,
  validateFileUpload,
} = require("./middlewares/securityMiddleware");
const {
  securityAuditMiddleware,
  checkSessionSecurity,
} = require("./middlewares/securityAudit");

// Basic middleware setup
app.use(express.json({ limit: "10mb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Configure CORS EARLY so even early responses (e.g., 429) include headers
// Configure CORS
let allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Sensible defaults for production if not explicitly configured
if (allowedOrigins.length === 0) {
  const defaults = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://communiatec.vercel.app",
  ].filter(Boolean);
  allowedOrigins = Array.from(new Set(defaults));
}

// Optional: allow Vercel preview deployments if enabled
const allowVercelPreviews =
  String(process.env.ALLOW_VERCEL_PREVIEWS || "true") === "true";

console.log("🔍 CORS Configuration:", {
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
  parsedOrigins: allowedOrigins,
  allowVercelPreviews,
});

const corsOptions = {
  origin: (origin, callback) => {
    const isAllowedExplicit = !!origin && allowedOrigins.includes(origin);
    const isVercelPreview =
      !!origin &&
      allowVercelPreviews &&
      /https?:\/\/[a-z0-9-]+\.[a-z0-9-]+\.vercel\.app$/i.test(origin);

    console.log("🌐 CORS Check:", {
      requestOrigin: origin,
      allowedOrigins,
      isAllowedExplicit,
      isVercelPreview,
    });

    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (isAllowedExplicit || isVercelPreview) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`)); // block other origins
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cookie",
    "Origin",
  ],
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options("*", cors(corsOptions));

// Enhanced CORS headers middleware for better reliability
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Always set CORS headers for allowed origins
  const isAllowedExplicit = !!origin && allowedOrigins.includes(origin);
  const isVercelPreview =
    !!origin &&
    allowVercelPreviews &&
    /https?:\/\/[a-z0-9-]+\.[a-z0-9-]+\.vercel\.app$/i.test(origin);
  if (!origin || isAllowedExplicit || isVercelPreview) {
    // Never use * when credentials are enabled
    res.header(
      "Access-Control-Allow-Origin",
      origin || "http://localhost:5173"
    );
    res.header("Vary", "Origin");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Cookie, Set-Cookie, Origin"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "Set-Cookie");
  }

  // Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// ✨ COMPREHENSIVE SECURITY MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: false, // We'll handle CSP in our custom middleware
    crossOriginEmbedderPolicy: false,
  })
);

// Input sanitization and validation
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(xssProtection); // Custom XSS protection
app.use(validateInput); // Enhanced input validation
app.use(securityHeaders); // Custom security headers
app.use(securityAuditMiddleware); // Security event logging

// Rate limiting
// Use a custom general API limiter that is proxy-aware and skips preflight/status/auth-info
const rateLimit = require("express-rate-limit");
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // more generous to avoid false 429 spikes from shared IPs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // respects trust proxy
  skip: (req) =>
    req.method === "OPTIONS" ||
    req.originalUrl.startsWith("/api/maintenance/status") ||
    req.originalUrl.startsWith("/api/auth/userInfo") ||
    req.originalUrl.startsWith("/api/health") ||
    req.originalUrl.startsWith("/api/keepalive"),
  message: {
    error: "API rate limit exceeded",
    retryAfter: 15 * 60,
  },
});
app.use("/api", generalApiLimiter);
app.use("/api/auth/login", authLimiter); // Stricter auth rate limit
app.use("/api/auth/github", authLimiter);
app.use("/api/auth/linkedin", authLimiter);

// Static file serving
app.use(
  "/uploads/profile-images",
  express.static(path.join(__dirname, "uploads/profile-images"))
);

// Maintenance status endpoint (must be before maintenance middleware)
app.get("/api/maintenance/status", async (req, res) => {
  try {
    const settings = await Setting.findOne();
    console.log("📋 Maintenance status checked at:", new Date().toISOString());
    res.json({
      maintenanceMode: settings?.maintenanceMode || false,
      timestamp: new Date().toISOString(),
      server: "online",
    });
  } catch (err) {
    console.error("Error fetching maintenance status:", err);
    res.json({
      maintenanceMode: false,
      timestamp: new Date().toISOString(),
      server: "online",
    });
  }
});

// Keepalive endpoint to prevent Render from sleeping
app.get("/api/keepalive", (req, res) => {
  console.log("🏃‍♂️ Keepalive ping received at:", new Date().toISOString());
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    server: "Communiatec Backend",
  });
});

// ✨ CRITICAL FIX: Apply maintenance middleware BEFORE API routes
app.use("/api", maintenanceMiddleware);

// ✨ NOW apply your API routes (maintenance middleware will check them)
app.use("/api/auth", AuthRoute);
app.use("/api", checkSessionSecurity, profileRoute); // Add session security check
app.use("/api/contact", ContactRoutes);
app.use("/api/message", checkSessionSecurity, messageRoutes); // Add session security check
app.use("/api/admin", checkSessionSecurity, adminRoutes); // Add session security check
app.use("/api/code", checkSessionSecurity, codeRoutes); // Add session security check
app.use("/api/groups", checkSessionSecurity, groupRoutes); // Add session security check
app.use("/api/gemini", require("./routes/geminiRoutes"));
app.use(
  "/api/message-suggestions",
  require("./routes/messageSuggestionRoutes")
);
app.use("/api/ai-suggestions", require("./routes/aiSuggestionRoutes"));
app.use("/api/zoro", require("./routes/zoroRoutes"));

// Health check endpoint (bypasses maintenance in the middleware itself)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "connected",
      redis: "not configured",
      code_collaboration: "enabled",
    },
  });
});

// Rest of your server setup remains the same...
// ✨ ENHANCED: Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ✨ ENHANCED: 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      "GET /api/health",
      "POST /api/auth/login",
      "GET /api/auth/userInfo",
      "POST /api/code/create-session",
      "GET /api/code/join/:sessionId",
      "POST /api/code/execute",
    ],
  });
});

// Create HTTP server
const server = http.createServer(app);

/// Server/server.js - Updated sections only

// Replace the existing socket setup section with this:

// ✨ ENHANCED: Socket.io configuration with better error handling
const socketAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  ...allowedOrigins,
];

const io = new Server(server, {
  cors: {
    origin: socketAllowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // ✨ Enhanced socket.io options
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false,
  serveClient: false,
  allowEIO3: true,
});

// Make io globally accessible for controllers
global.io = io;

// ✨ ENHANCED: Socket error handling
io.engine.on("connection_error", (err) => {
  console.error("🚨 Socket.io connection error:", {
    message: err.message,
    description: err.description,
    context: err.context,
    type: err.type,
    timestamp: new Date().toISOString(),
  });
});

// Make io and userSocketMap available to app
app.set("io", io);

// Setup existing chat socket (your existing socket handling) - MAIN NAMESPACE
setupSocket(io);

// Setup Group Chat Socket
try {
  const userSocketMap = new Map();
  // 🌐 Make user-socket map globally accessible so REST routes can emit socket events
  global.userSocketMap = userSocketMap;
  app.set("userSocketMap", userSocketMap);

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    }

    handleGroupSocket(io, socket, userSocketMap);

    socket.on("disconnect", () => {
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });
  console.log("✅ Group chat socket handlers initialized");
} catch (error) {
  console.error("🚨 Error initializing group chat socket handlers:", error);
}

// ✨ FIXED: Setup Code Collaboration Socket on /code namespace
try {
  const codeNamespace = handleCodeCollaboration(io);
  console.log(
    "✅ Code collaboration socket handlers initialized on /code namespace"
  );

  // Monitor code namespace connections
  codeNamespace.on("connection", (socket) => {
    console.log(
      `👤 Code client connected: ${socket.id} from ${socket.handshake.address}`
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `👋 Code client disconnected: ${socket.id}, reason: ${reason}`
      );
    });

    socket.on("error", (error) => {
      console.error(`🚨 Code socket error for ${socket.id}:`, error);
    });
  });

  // Setup Coffee Break Socket
  const handleCoffeeBreakSocket = require("./socket-handlers/coffeeBreakSocket");
  const coffeeBreakNamespace = handleCoffeeBreakSocket(io);
  console.log(
    "✅ Coffee break socket handlers initialized on /coffee-break namespace"
  );
} catch (error) {
  console.error("❌ Failed to initialize code collaboration:", error.message);
}

// ✨ ENHANCED: Connection monitoring for MAIN namespace only
io.on("connection", (socket) => {
  console.log(
    `👤 Chat client connected: ${socket.id} from ${socket.handshake.address}`
  );

  socket.on("disconnect", (reason) => {
    console.log(`👋 Chat client disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`🚨 Chat socket error for ${socket.id}:`, error);
  });
});

// Rest of your server setup remains the same...

// Connect to database
dbConnect();

// ✨ ENHANCED: Server startup with better logging
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log("🚀 Communiatec Server Started!");
  console.log("=".repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/message`);
  console.log(`👤 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`💻 Code Collaboration: http://localhost:${PORT}/api/code`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 Socket.io enabled for real-time features`);
  console.log("=".repeat(50));

  // Start keepalive mechanism for Render free tier
  if (process.env.NODE_ENV === "production") {
    console.log("🏃‍♂️ Starting server keepalive mechanism...");

    // Self-ping every 10 minutes to prevent sleep (Render sleeps after 15 minutes)
    const keepAliveInterval = setInterval(() => {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;

      // Use fetch or http to ping our own server
      fetch(`${serverUrl}/api/keepalive`)
        .then(() => {
          console.log("✅ Keepalive ping successful");
        })
        .catch((error) => {
          console.log("⚠️  Keepalive ping failed:", error.message);
        });
    }, 10 * 60 * 1000); // 10 minutes

    // Clear interval on server shutdown
    process.on("SIGTERM", () => {
      clearInterval(keepAliveInterval);
    });

    process.on("SIGINT", () => {
      clearInterval(keepAliveInterval);
    });
  }
});

// ✨ ENHANCED: Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("📤 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📤 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// ✨ ENHANCED: Unhandled error catching
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Promise Rejection:", {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString(),
  });
});

process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Graceful shutdown on uncaught exception
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // Export for testing
