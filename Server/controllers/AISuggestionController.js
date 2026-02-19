const { GoogleGenerativeAI } = require('@google/generative-ai');
const AISuggestion = require('../models/AISuggestionModel');
const Message = require('../models/MessageModel');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel(
  { model: 'gemini-2.5-flash' },
  { apiVersion: 'v1' }
);

const AISuggestionController = {
  // Generate context-aware suggestions
  generateSuggestions: async (req, res) => {
    try {
      const { messageContext, userId, recipientId } = req.body;

      // Get recent chat history for context
      const recentMessages = await Message.find({
        $or: [
          { sender: userId, recipient: recipientId },
          { sender: recipientId, recipient: userId }
        ]
      })
      .sort({ timeStamp: -1 })
      .limit(5)
      .populate("sender", "firstName lastName");

      // Create context string for AI
      const contextString = recentMessages
        .reverse()
        .map(msg => `${msg.sender.firstName}: ${msg.content}`)
        .join('\n');

      // Generate AI suggestions
      const prompt = `Given this chat context:
${contextString}

Current message draft: "${messageContext}"

Generate 3 types of suggestions:
1. A quick response (short and casual)
2. A smart suggestion (thoughtful and detailed)
3. An action suggestion (if applicable, like scheduling, sharing resources, etc.)

Format: JSON with suggestions array`;

      const result = await model.generateContent(prompt);
      const suggestionsText = result.response.text();
      const suggestions = JSON.parse(suggestionsText);

      // Store suggestions in database
      const storedSuggestions = await Promise.all(
        suggestions.suggestions.map(async (suggestion) => {
          return await AISuggestion.create({
            chatContext: messageContext,
            suggestion: suggestion.text,
            suggestionType: suggestion.type
          });
        })
      );

      return res.status(200).json({
        success: true,
        suggestions: storedSuggestions
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate suggestions',
        error: error.message
      });
    }
  },

  // Get suggestions for specific chat context
  getSuggestions: async (req, res) => {
    try {
      const { messageContext } = req.body;
      
      const suggestions = await AISuggestion.find({
        chatContext: { $regex: messageContext, $options: 'i' },
        used: false
      })
      .sort({ timestamp: -1 })
      .limit(3);

      return res.status(200).json({
        success: true,
        suggestions
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch suggestions',
        error: error.message
      });
    }
  },

  // Mark suggestion as used
  markSuggestionUsed: async (req, res) => {
    try {
      const { suggestionId } = req.body;
      
      await AISuggestion.findByIdAndUpdate(suggestionId, {
        used: true
      });

      return res.status(200).json({
        success: true,
        message: 'Suggestion marked as used'
      });
    } catch (error) {
      console.error('Error marking suggestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark suggestion',
        error: error.message
      });
    }
  }
};

module.exports = AISuggestionController;
