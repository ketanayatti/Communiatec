const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema({
    chatContext: {
        type: String,
        required: true
    },
    suggestion: {
        type: String,
        required: true
    },
    suggestionType: {
        type: String,
        enum: ['quick_response', 'smart_suggestion', 'action'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    used: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('AISuggestion', aiSuggestionSchema);
