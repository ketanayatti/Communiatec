// Server/models/CodeSessionModel.js
const mongoose = require("mongoose");

const codeSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      default: "javascript",
      enum: [
        "javascript",
        "python",
        "java",
        "cpp",
        "c",
        "typescript",
        "html",
        "css",
        "json",
        "markdown",
      ],
    },
    code: {
      type: String,
      default:
        '// Welcome to Communiatec Code Collaboration\n// Start coding together!\nconsole.log("Hello, World!");',
    },
    participants: [
      {
        userId: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        cursor: {
          line: {
            type: Number,
            default: 1,
            min: 1,
          },
          column: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
        socketId: {
          type: String,
        },
        lastActive: {
          type: Date,
          default: Date.now,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
    // Track session statistics
    stats: {
      totalLines: {
        type: Number,
        default: 0,
      },
      totalCharacters: {
        type: Number,
        default: 0,
      },
      totalEdits: {
        type: Number,
        default: 0,
      },
      uniqueParticipants: {
        type: Number,
        default: 0,
      },
    },
    // Session settings
    settings: {
      maxParticipants: {
        type: Number,
        default: 10,
      },
      allowAnonymous: {
        type: Boolean,
        default: false,
      },
      readOnly: {
        type: Boolean,
        default: false,
      },
    },
    // Expiry and cleanup
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Automatically remove expired sessions
    expireAfterSeconds: 0, // Uses expiresAt field
  }
);

// Indexes for better performance
// `sessionId` already has `unique: true, index: true` on its field definition above,
// so don't redefine it here to avoid duplicate-index warnings from Mongoose.
codeSessionSchema.index({ createdBy: 1 });
codeSessionSchema.index({ isPublic: 1, isActive: 1 });
codeSessionSchema.index({ expiresAt: 1 });
codeSessionSchema.index({ "participants.userId": 1 });

// Middleware to update stats before saving
codeSessionSchema.pre("save", function (next) {
  if (this.isModified("code")) {
    // Update code statistics
    const lines = this.code.split("\n").length;
    const characters = this.code.length;

    this.stats.totalLines = lines;
    this.stats.totalCharacters = characters;
    this.lastModified = new Date();

    // Increment edit count
    if (!this.isNew) {
      this.stats.totalEdits += 1;
    }
  }

  if (this.isModified("participants")) {
    // Update unique participants count
    const uniqueUserIds = [...new Set(this.participants.map((p) => p.userId))];
    this.stats.uniqueParticipants = uniqueUserIds.length;
  }

  next();
});

// Instance methods
codeSessionSchema.methods.addParticipant = function (participantData) {
  const existingIndex = this.participants.findIndex(
    (p) => p.userId.toString() === participantData.userId.toString()
  );

  if (existingIndex >= 0) {
    // Update existing participant
    this.participants[existingIndex] = {
      ...this.participants[existingIndex].toObject(),
      ...participantData,
      lastActive: new Date(),
    };
  } else {
    // Add new participant
    this.participants.push({
      ...participantData,
      joinedAt: new Date(),
      lastActive: new Date(),
    });
  }

  return this.save();
};

codeSessionSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    (p) => p.userId.toString() !== userId.toString()
  );
  return this.save();
};

codeSessionSchema.methods.updateParticipantCursor = function (userId, cursor) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );

  if (participant) {
    participant.cursor = cursor;
    participant.lastActive = new Date();
    return this.save();
  }

  return Promise.resolve(this);
};

codeSessionSchema.methods.isParticipant = function (userId) {
  return this.participants.some(
    (p) => p.userId.toString() === userId.toString()
  );
};

codeSessionSchema.methods.getActiveParticipants = function () {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.participants.filter((p) => p.lastActive > fiveMinutesAgo);
};

// Static methods
codeSessionSchema.statics.findActiveSession = function (sessionId) {
  return this.findOne({
    sessionId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

codeSessionSchema.statics.findUserSessions = function (userId) {
  return this.find({
    $or: [{ createdBy: userId }, { "participants.userId": userId }],
    isActive: true,
  }).sort({ lastModified: -1 });
};

codeSessionSchema.statics.cleanupInactiveSessions = function () {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  return this.updateMany(
    {
      lastModified: { $lt: thirtyMinutesAgo },
      "participants.0": { $exists: false }, // No participants
    },
    {
      $set: { isActive: false },
    }
  );
};

// Virtual for participant count
codeSessionSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Virtual for active participant count
codeSessionSchema.virtual("activeParticipantCount").get(function () {
  return this.getActiveParticipants().length;
});

// Ensure virtuals are included in JSON output
codeSessionSchema.set("toJSON", { virtuals: true });
codeSessionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CodeSession", codeSessionSchema);
