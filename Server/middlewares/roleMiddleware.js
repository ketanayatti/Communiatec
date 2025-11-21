const User = require('../models/UserModel');

/**
 * requireRole middleware
 * - Loads the requesting user from DB and attaches it to req.requestingUser
 * - If `roles` is provided, ensures requesting user has one of the allowed roles
 */
exports.requireRole = (roles = []) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const requestingUser = await User.findById(req.user.id).select('-password');
    if (!requestingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.requestingUser = requestingUser;

    if (Array.isArray(roles) && roles.length > 0) {
      if (!roles.includes(requestingUser.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    return next();
  } catch (error) {
    console.error('Role middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
