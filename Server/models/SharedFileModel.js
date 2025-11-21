const mongoose = require('mongoose');

const sharedFileSchema = new mongoose.Schema({
  originalFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ZoroFile',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ZoroFile',
    default: null // Will be populated when recipient accepts the file
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Indexes for efficient querying
sharedFileSchema.index({ owner: 1, createdAt: -1 });
sharedFileSchema.index({ recipient: 1, status: 1, createdAt: -1 });
sharedFileSchema.index({ originalFile: 1 });

module.exports = mongoose.model('SharedFile', sharedFileSchema);