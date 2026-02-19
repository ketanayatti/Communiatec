/**
 * IAM Configuration
 * Defines all available permissions and maps them to roles.
 */

const PERMISSIONS = {
  // User Management
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_MANAGE_ROLES: "users:manage_roles",

  // Message Management
  MESSAGES_READ: "messages:read",
  MESSAGES_DELETE: "messages:delete",

  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",

  // Events
  EVENTS_READ: "events:read",
  EVENTS_CREATE: "events:create",
  EVENTS_DELETE: "events:delete",

  // System
  SYSTEM_MAINTENANCE: "system:maintenance",
  MAINTENANCE_BYPASS: "maintenance:bypass",
};

const ROLES = {
  admin: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE_ROLES,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.SYSTEM_MAINTENANCE,
    PERMISSIONS.MAINTENANCE_BYPASS,
  ],
  user: [
    // Regular users have implicit permissions for their own data,
    // but we can define explicit system permissions here if needed.
    // For now, they might just have read access to public events.
    PERMISSIONS.EVENTS_READ,
  ],
};

module.exports = {
  PERMISSIONS,
  ROLES,
};
