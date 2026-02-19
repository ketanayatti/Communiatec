const User = require("../models/UserModel");
const { ROLES, PERMISSIONS } = require("../config/iamConfig");
const logger = require("../utils/logger");

/**
 * Check if a user has a specific permission.
 * @param {string} role - The user's role.
 * @param {string} permission - The permission to check.
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const rolePermissions = ROLES[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Middleware to require a specific permission.
 * @param {string} permission - The permission required to access the route.
 */
const requirePermission = (permission) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // We can use the role from the JWT token (req.user.role) to avoid a DB call
    // if we trust the token's validity period.
    // However, for critical IAM checks, fetching the latest role from DB is safer.
    const user = await User.findById(req.user.id).select("role email");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!hasPermission(user.role, permission)) {
      logger.warn(
        `IAM: Access denied. User ${user.email} (Role: ${user.role}) attempted to access ${permission}`
      );
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        requiredPermission: permission,
      });
    }

    // Attach full user object to request for downstream use
    req.requestingUser = user;
    next();
  } catch (error) {
    logger.error("IAM Middleware error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error during authorization check",
      });
  }
};

module.exports = {
  requirePermission,
  hasPermission,
};
