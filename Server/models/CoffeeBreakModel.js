const mongoose = require("mongoose");

const coffeeBreakSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["waiting", "matched", "completed"],
      default: "waiting"
    },
    preferences: {
      anonymous: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 5, // Duration in minutes
        min: 3,
        max: 15
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  matchedPairs: [{
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete documents after 24 hours
  }
});

module.exports = mongoose.model("CoffeeBreak", coffeeBreakSchema);