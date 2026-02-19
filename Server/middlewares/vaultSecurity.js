const crypto = require('crypto');
const { encrypt, decrypt } = require('../utils/simpleEncryption');

/**
 * Enhanced Vault Security Middleware and Utilities
 * Provides additional security layers for the Zoro Vault system
 */

// File access logging
const logFileAccess = (action, fileId, userId, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action, // 'upload', 'download', 'share', 'delete'
    fileId,
    userId,
    ...details
  };
  
  // In production, send to security monitoring system
  console.log(`🗂️  VAULT ACCESS:`, JSON.stringify(logEntry, null, 2));
};

// Generate secure sharing token
const generateSharingToken = (fileId, ownerId, recipientId) => {
  const tokenData = {
    fileId,
    ownerId,
    recipientId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  return encrypt(JSON.stringify(tokenData));
};

// Validate sharing token
const validateSharingToken = (token) => {
  try {
    const decrypted = decrypt(token);
    const tokenData = JSON.parse(decrypted);
    
    // Check if token is not older than 7 days
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - tokenData.timestamp > sevenDaysInMs) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, data: tokenData };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
};

// File access permission checker
const checkFileAccess = async (fileId, userId, action = 'read') => {
  const ZoroFile = require('../models/ZoroFileModel');
  const SharedFile = require('../models/SharedFileModel');
  
  try {
    // Check if user owns the file
    const ownedFile = await ZoroFile.findOne({ _id: fileId, user: userId });
    if (ownedFile) {
      return { 
        hasAccess: true, 
        accessType: 'owner',
        file: ownedFile 
      };
    }
    
    // Check if file is shared with user and accepted
    if (action === 'read' || action === 'download') {
      const sharedFile = await SharedFile.findOne({
        originalFile: fileId,
        recipient: userId,
        status: 'accepted'
      }).populate('originalFile');
      
      if (sharedFile) {
        return { 
          hasAccess: true, 
          accessType: 'shared',
          file: sharedFile.originalFile,
          sharedFile: sharedFile
        };
      }
    }
    
    return { hasAccess: false, accessType: null };
  } catch (error) {
    console.error('File access check error:', error);
    return { hasAccess: false, accessType: null, error: error.message };
  }
};

// Secure file metadata sanitizer
const sanitizeFileMetadata = (file, userId, accessType = 'owner') => {
  const sanitized = {
    _id: file._id,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.size,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt
  };
  
  // Only include sensitive data for owners
  if (accessType === 'owner') {
    sanitized.url = file.url;
    sanitized.public_id = file.public_id;
  } else if (accessType === 'shared') {
    // For shared files, provide limited access
    sanitized.isShared = true;
    sanitized.accessType = 'read-only';
  }
  
  return sanitized;
};

// File sharing audit middleware
const auditFileSharing = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log successful file sharing operations
    if (res.statusCode === 200 || res.statusCode === 201) {
      const action = req.route.path.includes('share') ? 'share' : 
                    req.route.path.includes('accept') ? 'accept' : 
                    req.route.path.includes('decline') ? 'decline' : 'unknown';
      
      if (action !== 'unknown') {
        logFileAccess(action, req.params.id, req.id, {
          recipientEmail: req.body.recipientEmail,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// File upload security validator
const validateFileUploadSecurity = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided for upload'
    });
  }
  
  for (const file of req.files) {
    // Check for suspicious file patterns
    const suspiciousPatterns = [
      /\.php/i, /\.asp/i, /\.jsp/i, /\.exe/i, /\.sh/i, /\.bat/i, 
      /\.cmd/i, /\.scr/i, /\.vbs/i, /\.js$/i, /\.jar/i
    ];
    
    const hasSuspiciousExtension = suspiciousPatterns.some(pattern => 
      pattern.test(file.originalname)
    );
    
    if (hasSuspiciousExtension) {
      logFileAccess('upload_blocked', null, req.id, {
        filename: file.originalname,
        reason: 'Suspicious file extension',
        size: file.size,
        mimeType: file.mimetype
      });
      
      return res.status(400).json({
        success: false,
        message: `File type not allowed for security reasons: ${file.originalname}`
      });
    }
    
    // Check file size limits (already handled by multer, but double-check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large: ${file.originalname} (${file.size} bytes)`
      });
    }
    
    // Check MIME type consistency
    const allowedTypes = [
      'application/pdf', 'application/msword', 'application/zip',
      'text/plain', 'image/jpeg', 'image/png', 'image/gif'
    ];
    
    if (!allowedTypes.includes(file.mimetype) && 
        !file.mimetype.startsWith('application/vnd.') && 
        !file.mimetype.startsWith('image/') && 
        !file.mimetype.startsWith('text/')) {
      
      logFileAccess('upload_blocked', null, req.id, {
        filename: file.originalname,
        reason: 'Unsupported MIME type',
        mimeType: file.mimetype
      });
      
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${file.mimetype}`
      });
    }
  }
  
  next();
};

// Secure download middleware
const secureDownload = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const userId = req.id;
    
    // Check access permissions
    const accessCheck = await checkFileAccess(fileId, userId, 'download');
    
    if (!accessCheck.hasAccess) {
      logFileAccess('download_denied', fileId, userId, {
        reason: 'Access denied',
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Log successful download
    logFileAccess('download', fileId, userId, {
      filename: accessCheck.file.filename,
      accessType: accessCheck.accessType,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Attach access info to request
    req.fileAccess = accessCheck;
    next();
    
  } catch (error) {
    console.error('Secure download middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Security check failed'
    });
  }
};

// File sharing permission validator
const validateSharingPermissions = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const userId = req.id;
    
    // Only file owners can share files
    const accessCheck = await checkFileAccess(fileId, userId, 'share');
    
    if (!accessCheck.hasAccess || accessCheck.accessType !== 'owner') {
      logFileAccess('share_denied', fileId, userId, {
        reason: 'Not owner',
        recipientEmail: req.body.recipientEmail,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        message: 'Only file owners can share files'
      });
    }
    
    req.fileAccess = accessCheck;
    next();
    
  } catch (error) {
    console.error('Share permission validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Permission validation failed'
    });
  }
};

// Rate limiting for vault operations
const createVaultRateLimit = require('express-rate-limit');

const vaultUploadLimiter = createVaultRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.'
  }
});

const vaultShareLimiter = createVaultRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 shares per minute
  message: {
    success: false,
    message: 'Too many sharing attempts. Please try again later.'
  }
});

const vaultDownloadLimiter = createVaultRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 downloads per minute
  message: {
    success: false,
    message: 'Too many download attempts. Please try again later.'
  }
});

module.exports = {
  logFileAccess,
  generateSharingToken,
  validateSharingToken,
  checkFileAccess,
  sanitizeFileMetadata,
  auditFileSharing,
  validateFileUploadSecurity,
  secureDownload,
  validateSharingPermissions,
  vaultUploadLimiter,
  vaultShareLimiter,
  vaultDownloadLimiter
};