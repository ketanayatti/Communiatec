const mongoose = require('mongoose');

const messageSuggestionSchema = new mongoose.Schema({
  chatContext: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  suggestion: {
    type: String,
    required: true,
  },
  suggestionType: {
    type: String,
    enum: [
      "quick_response",
      "followup_question",
      "action_suggestion",
      "clarification",
      "agreement",
      "question",
      "scheduling",
      "task",
      "other",
      "thanks",
      "confirm",
      "acknowledge",
      "small_talk",
      "meeting_schedule",
      "meeting_followup",
      "availability",
      "alignment",
      "next_steps",
      "status_update",
      "deadline",
      "escalation",
      "apology"
    ],
    required: true,
  },

  category: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Allow any non-empty string for flexibility
        return v && v.length > 0;
      },
      message: "Category must be a non-empty string",
    },
  },
  context: {
    messageHistory: [
      {
        type: String,
        required: true,
      },
    ],
    lastUserMessage: String,
    conversationTone: String,
  },
  used: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MessageSuggestion', messageSuggestionSchema);
