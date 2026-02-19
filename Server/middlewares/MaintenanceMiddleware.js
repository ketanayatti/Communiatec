const jwt = require("jsonwebtoken");
const Setting = require("../models/SettingModel");
const User = require("../models/UserModel");
const { hasPermission } = require("./iamMiddleware");
const { PERMISSIONS } = require("../config/iamConfig");

// Simple in-memory cache to avoid a DB read on every request.
let cachedSettings = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds cache

/**
 * Middleware that blocks non-admin traffic when maintenanceMode is enabled.
 * Admins (identified via their JWT) can continue to access the site normally
 * so they can verify changes before re-opening the platform.
 */
module.exports = async function maintenanceMiddleware(req, res, next) {
  try {
    // Skip maintenance check for health and status endpoints
    const bypassPaths = ["/api/health", "/api/maintenance/status"];
    if (bypassPaths.includes(req.originalUrl)) {
      return next();
    }

    // Refresh cache if expired or doesn't exist
    if (!cachedSettings || Date.now() - cacheTimestamp > CACHE_TTL) {
      try {
        cachedSettings = await Setting.findOne();
        cacheTimestamp = Date.now();
        console.log(
          `🔄 Maintenance settings refreshed: ${
            cachedSettings?.maintenanceMode ? "ON" : "OFF"
          }`
        );
      } catch (dbError) {
        console.error("Database error in maintenance middleware:", dbError);
        // If DB is down, allow traffic through to prevent complete lockout
        return next();
      }
    }

    // If maintenance is OFF or no settings exist, let everything through
    if (!cachedSettings || cachedSettings.maintenanceMode === false) {
      return next();
    }

    console.log(
      `🚧 Maintenance mode is ON - checking request: ${req.method} ${req.originalUrl}`
    );

    // ALWAYS allow auth routes so admins can sign in during maintenance
    if (req.originalUrl.startsWith("/api/auth")) {
      console.log("✅ Allowing auth route during maintenance");
      return next();
    }

    // Try to decode the JWT to check if the requester is an admin
    const cookieToken = req.cookies?.token;
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    let isAdmin = false;
    let userId = null;

    if (token) {
      try {
        // Use the same JWT secret as used in AuthController
        const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY;
        const decoded = jwt.verify(token, jwtSecret);
        userId = decoded.id; // Your JWT uses 'id' field

        // Fetch user from database to verify permissions
        const user = await User.findById(userId);
        if (user && hasPermission(user.role, PERMISSIONS.MAINTENANCE_BYPASS)) {
          isAdmin = true; // Keeping variable name for minimal code change, but now means "has bypass permission"
          console.log(
            `✅ User ${user.email} (Role: ${user.role}) accessing during maintenance`
          );
        } else if (user) {
          console.log(
            `🚫 User ${user.email} (Role: ${user.role}) blocked during maintenance`
          );
        }
      } catch (jwtError) {
        console.log(
          "❌ Invalid token during maintenance check:",
          jwtError.message
        );
        // Invalid token - treat as non-admin
      }
    } else {
      console.log("❌ No token provided during maintenance mode");
    }

    // Allow admins to pass through
    if (isAdmin) {
      return next();
    }

    // Block everyone else with maintenance message
    console.log(
      `🚫 Blocking non-admin request: ${req.method} ${req.originalUrl}`
    );
    return res.status(503).json({
      success: false,
      message:
        "Communiatec is currently undergoing maintenance. Please check back soon.",
      maintenanceMode: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Maintenance middleware error:", err);
    // On error, fail open so the site remains accessible
    // This prevents a broken maintenance system from locking everyone out
    next();
  }
};
