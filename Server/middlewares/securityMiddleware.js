const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

/**
 * Enhanced Security Middleware Configuration
 * Provides comprehensive protection against common web vulnerabilities
 */

// XSS Protection (manual implementation since xss-clean is deprecated)
const xssProtection = (req, res, next) => {
  // Basic XSS protection for common fields
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  const sanitizeObject = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(xssPattern, "").replace(/[<>]/g, "");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Enhanced rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Never rate-limit CORS preflight requests
    skip: (req, _res) => req.method === "OPTIONS",
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
  });

// Specific rate limiters
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts
  "Too many authentication attempts, please try again later"
);

const uploadLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 uploads per minute
  "Too many file uploads, please wait"
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  "API rate limit exceeded"
);

// Input validation middleware
const validateInput = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin)/i, // MongoDB injection
    /(union\s+select|drop\s+table|insert\s+into)/i, // SQL injection patterns
    /(javascript:|data:text\/html)/i, // XSS patterns
    /(\.\.\/)/, // Path traversal
  ];

  const checkForSuspiciousInput = (obj, path = "") => {
    if (typeof obj === "string") {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          console.warn(
            `🚨 Suspicious input detected at ${path}:`,
            obj.substring(0, 100)
          );
          return res.status(400).json({
            success: false,
            message: "Invalid input detected",
          });
        }
      }
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = checkForSuspiciousInput(obj[i], `${path}[${i}]`);
        if (result) return result;
      }
    } else if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        const result = checkForSuspiciousInput(value, `${path}.${key}`);
        if (result) return result;
      }
    }
    return null;
  };

  // Check request body, query, and params
  const result =
    checkForSuspiciousInput(req.body, "body") ||
    checkForSuspiciousInput(req.query, "query") ||
    checkForSuspiciousInput(req.params, "params");

  if (result) return result;

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https: wss: ws:; " +
      "frame-ancestors 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self';"
  );

  // Additional security headers
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // HSTS (HTTP Strict Transport Security) - 1 year
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};

// File upload security
const validateFileUpload = (req, res, next) => {
  if (req.files || req.file) {
    const files = req.files || [req.file];

    for (const file of files) {
      if (!file) continue;

      // Check file size (already handled by multer, but double-check)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "File size exceeds maximum allowed size (10MB)",
        });
      }

      // Validate file extension matches MIME type
      const allowedTypes = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/gif": [".gif"],
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
        "application/json": [".json"],
      };

      if (file.mimetype && allowedTypes[file.mimetype]) {
        const validExtensions = allowedTypes[file.mimetype];
        const fileExtension = file.originalname
          .toLowerCase()
          .match(/\.[^.]+$/)?.[0];

        if (!validExtensions.includes(fileExtension)) {
          console.warn(
            `🚨 File extension mismatch: ${file.originalname} (${file.mimetype})`
          );
          return res.status(400).json({
            success: false,
            message: "File extension does not match file type",
          });
        }
      }
    }
  }

  next();
};

module.exports = {
  xssProtection,
  mongoSanitize,
  hpp,
  authLimiter,
  uploadLimiter,
  apiLimiter,
  validateInput,
  securityHeaders,
  validateFileUpload,
};
