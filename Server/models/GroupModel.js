const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  avatar: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["private", "public"],
    default: "private",
  },
  settings: {
    allowMemberInvite: {
      type: Boolean,
      default: false,
    },
    allowMessageDelete: {
      type: Boolean,
      default: true,
    },
    allowMediaSharing: {
      type: Boolean,
      default: true,
    },
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
groupSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Group', groupSchema);