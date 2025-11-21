const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const settingController = require("../controllers/SettingController");
const eventController = require("../controllers/EventController");
const verifyToken = require("../middlewares/AuthMiddleware");
const { requirePermission } = require("../middlewares/iamMiddleware");
const { PERMISSIONS } = require("../config/iamConfig");

// Dashboard stats
router.get(
  "/dashboard-stats",
  verifyToken,
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  adminController.getDashboardStats
);

// User management routes
router.get(
  "/users",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_READ),
  adminController.getAllUsers
);
router.post(
  "/users",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_CREATE),
  adminController.createUser
);
router.put(
  "/users/update-role",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_MANAGE_ROLES),
  adminController.updateUserRole
);
router.delete(
  "/users/:userId",
  verifyToken,
  requirePermission(PERMISSIONS.USERS_DELETE),
  adminController.deleteUser
);

// Message management routes
router.get(
  "/messages",
  verifyToken,
  requirePermission(PERMISSIONS.MESSAGES_READ),
  adminController.getRecentMessages
);
router.delete(
  "/messages/:messageId",
  verifyToken,
  requirePermission(PERMISSIONS.MESSAGES_DELETE),
  adminController.deleteMessage
);

// System settings routes
router.get(
  "/settings",
  verifyToken,
  requirePermission(PERMISSIONS.SETTINGS_VIEW),
  settingController.getSettings
);
router.put(
  "/settings",
  verifyToken,
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  settingController.updateSettings
);

// Calendar event routes
router.get(
  "/events",
  verifyToken,
  requirePermission(PERMISSIONS.EVENTS_READ),
  eventController.getEvents
);
router.post(
  "/events",
  verifyToken,
  requirePermission(PERMISSIONS.EVENTS_CREATE),
  eventController.createEvent
);
router.delete(
  "/events/:id",
  verifyToken,
  requirePermission(PERMISSIONS.EVENTS_DELETE),
  eventController.deleteEvent
);

module.exports = router;
