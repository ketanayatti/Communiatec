const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const logger = require("../utils/logger");

/**
 * Security Audit Middleware and Utilities
 * Provides logging and monitoring for security events
 */

// Security event logger
const logSecurityEvent = (event, details, req = null) => {
  const timestamp = new Date().toISOString();
  const ip = req?.ip || req?.connection?.remoteAddress || "unknown";
  const userAgent = req?.get("User-Agent") || "unknown";

  const logEntry = {
    event,
    ip,
    userAgent,
    ...details,
  };

  // Log to winston logger
  if (details.severity === "HIGH" || details.severity === "CRITICAL") {
    logger.error(`SECURITY EVENT: ${event}`, logEntry);
  } else if (details.severity === "MEDIUM") {
    logger.warn(`SECURITY EVENT: ${event}`, logEntry);
  } else {
    logger.info(`SECURITY EVENT: ${event}`, logEntry);
  }
};

// Failed authentication logger
const logFailedAuth = (email, reason, req) => {
  logSecurityEvent(
    "FAILED_AUTHENTICATION",
    {
      email,
      reason,
      severity: "MEDIUM",
    },
    req
  );
};

// Successful authentication logger
const logSuccessfulAuth = (userId, email, role, req) => {
  logSecurityEvent(
    "SUCCESSFUL_AUTHENTICATION",
    {
      userId,
      email,
      role,
      severity: "INFO",
    },
    req
  );
};

// Suspicious activity logger
const logSuspiciousActivity = (activity, details, req) => {
  logSecurityEvent(
    "SUSPICIOUS_ACTIVITY",
    {
      activity,
      details,
      severity: "HIGH",
      url: req.originalUrl,
      method: req.method,
    },
    req
  );
};

// Rate limit exceeded logger
const logRateLimitExceeded = (endpoint, req) => {
  logSecurityEvent(
    "RATE_LIMIT_EXCEEDED",
    {
      endpoint,
      severity: "MEDIUM",
    },
    req
  );
};

// File upload security logger
const logFileUploadEvent = (filename, mimetype, size, userId, status) => {
  logSecurityEvent("FILE_UPLOAD", {
    filename,
    mimetype,
    size,
    userId,
    status, // 'ALLOWED' or 'BLOCKED'
    severity: status === "BLOCKED" ? "HIGH" : "INFO",
  });
};

// Permission denied logger
const logPermissionDenied = (userId, resource, action, req) => {
  logSecurityEvent(
    "PERMISSION_DENIED",
    {
      userId,
      resource,
      action,
      severity: "MEDIUM",
      url: req.originalUrl,
      method: req.method,
    },
    req
  );
};

// Input validation failure logger
const logInputValidationFailure = (field, value, reason, req) => {
  logSecurityEvent(
    "INPUT_VALIDATION_FAILURE",
    {
      field,
      value: value.substring(0, 100), // Limit logged value length
      reason,
      severity: "MEDIUM",
      url: req.originalUrl,
      method: req.method,
    },
    req
  );
};

// Security audit middleware
const securityAuditMiddleware = (req, res, next) => {
  // Track response to log any security-relevant events
  const originalSend = res.send;

  res.send = function (body) {
    // Log failed authentication attempts
    if (res.statusCode === 401 && req.originalUrl.includes("/auth/")) {
      logFailedAuth(req.body?.email || "unknown", "Invalid credentials", req);
    }

    // Log permission denied
    if (res.statusCode === 403) {
      logPermissionDenied(
        req.user?.id || "anonymous",
        req.originalUrl,
        req.method,
        req
      );
    }

    // Log input validation failures
    if (res.statusCode === 400 && typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        if (parsed.message && parsed.message.includes("validation")) {
          logInputValidationFailure(
            "unknown",
            JSON.stringify(req.body),
            parsed.message,
            req
          );
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return originalSend.call(this, body);
  };

  next();
};

// Password strength validator
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "123456",
    "password123",
    "admin",
    "qwerty",
    "letmein",
    "welcome",
    "monkey",
    "dragon",
    "pass",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common, please choose a stronger password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Session security checker
const checkSessionSecurity = async (req, res, next) => {
  if (req.user) {
    try {
      // Verify user still exists and is active
      const user = await User.findById(req.user.id);

      if (!user) {
        logSecurityEvent(
          "INVALID_SESSION",
          {
            userId: req.user.id,
            reason: "User no longer exists",
            severity: "HIGH",
          },
          req
        );

        return res.status(401).json({
          success: false,
          message: "Session invalid, please login again",
        });
      }

      // Check if user's role was changed (potential privilege escalation)
      if (user.role !== req.user.role) {
        logSecurityEvent(
          "ROLE_CHANGE_DETECTED",
          {
            userId: req.user.id,
            oldRole: req.user.role,
            newRole: user.role,
            severity: "HIGH",
          },
          req
        );

        // Force re-authentication for role changes
        return res.status(401).json({
          success: false,
          message: "Account permissions changed, please login again",
        });
      }

      req.currentUser = user; // Attach current user data
    } catch (error) {
      console.error("Session security check error:", error);
    }
  }

  next();
};

module.exports = {
  logSecurityEvent,
  logFailedAuth,
  logSuccessfulAuth,
  logSuspiciousActivity,
  logRateLimitExceeded,
  logFileUploadEvent,
  logPermissionDenied,
  logInputValidationFailure,
  securityAuditMiddleware,
  validatePasswordStrength,
  checkSessionSecurity,
};
