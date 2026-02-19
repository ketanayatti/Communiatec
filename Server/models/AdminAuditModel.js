const mongoose = require('mongoose');

const adminAuditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  target: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
