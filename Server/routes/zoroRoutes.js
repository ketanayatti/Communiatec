const express = require('express');
const router = express.Router();
const auth = require('../middlewares/AuthMiddleware');
const upload = require('../middlewares/vaultUpload');
const {
  uploadLimiter,
  validateFileUpload,
} = require("../middlewares/securityMiddleware");
const {
  auditFileSharing,
  validateFileUploadSecurity,
  secureDownload,
  validateSharingPermissions,
  vaultUploadLimiter,
  vaultShareLimiter,
  vaultDownloadLimiter,
} = require("../middlewares/vaultSecurity");
const ZoroController = require('../controllers/ZoroController');

// Upload one or multiple files with enhanced security
router.post('/upload', 
  auth, 
  vaultUploadLimiter, // Vault-specific rate limiting
  upload.array('files', 5), 
  validateFileUploadSecurity, // Vault-specific security validation
  ZoroController.uploadFiles
);

// List current user's files
router.get('/', auth, ZoroController.getUserFiles);

// Get download url with secure access control
router.get('/:id/download', 
  auth, 
  vaultDownloadLimiter,
  secureDownload, // Check file access permissions
  ZoroController.downloadFile
);

// Delete file (owners only)
router.delete('/:id', auth, ZoroController.deleteFile);

// Share file with another user (enhanced security)
router.post('/:id/share', 
  auth, 
  vaultShareLimiter,
  validateSharingPermissions, // Only owners can share
  auditFileSharing, // Log sharing events
  ZoroController.shareFile
);

// Get shared files (files shared with current user)
router.get('/shared/received', auth, ZoroController.getSharedFiles);

// Accept shared file with audit logging
router.post('/shared/:id/accept', 
  auth, 
  auditFileSharing,
  ZoroController.acceptSharedFile
);

// Decline shared file with audit logging
router.post('/shared/:id/decline', 
  auth, 
  auditFileSharing,
  ZoroController.declineSharedFile
);

// Get notifications
router.get('/notifications', auth, ZoroController.getNotifications);

// Mark notification as read
router.patch('/notifications/:id/read', auth, ZoroController.markNotificationRead);

// Mark all notifications as read
router.patch('/notifications/mark-all-read', auth, ZoroController.markAllNotificationsRead);

module.exports = router;