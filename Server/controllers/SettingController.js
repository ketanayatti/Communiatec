const Setting = require('../models/SettingModel');
const User = require('../models/UserModel');

// Fetch current system settings
exports.getSettings = async (req, res) => {
  try {
    // Verify admin role – token middleware attaches req.user
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Expect a single settings document; if missing create with defaults
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Error retrieving settings' });
  }
};

// Update system settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const update = req.body;
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const settings = await Setting.findOneAndUpdate({}, update, options);

    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
};