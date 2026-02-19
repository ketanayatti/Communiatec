const { GoogleGenerativeAI } = require('@google/generative-ai');
const MessageSuggestion = require('../models/MessageSuggestionModel');
const Message = require('../models/MessageModel');
const SuggestionService = require('../services/SuggestionService');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MessageSuggestionController = {
    // Generate suggestions based on chat context
    generateSuggestions: async (req, res) => {
        try {
            const { currentMessage, chatId, isGroup } = req.body;
            const userId = req.id; // From auth middleware

            // Check for existing, unused suggestions from the last 5 minutes
            const cachedSuggestions = await MessageSuggestion.find({
                chatContext: currentMessage,
                sender: userId,
                [isGroup ? 'group' : 'recipient']: chatId,
                used: false,
                timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
            }).limit(3);

            if (cachedSuggestions.length > 0) {
                return res.status(200).json({
                    success: true,
                    suggestions: cachedSuggestions
                });
            }

            // Get chat context (last 10 messages)
            const context = await Message.find({
                ...(isGroup 
                    ? { group: chatId } 
                    : { $or: [{ sender: userId, recipient: chatId }, { sender: chatId, recipient: userId }] }
                )
            })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

            // Get suggestions from service
            const suggestions = await SuggestionService.getSuggestions(currentMessage, context.reverse());

            // Store suggestions
            // Normalize suggestionType to avoid schema enum errors
            const normalizeType = (type) => {
                if (!type) return 'quick_response';
                const t = String(type).toLowerCase();
                const map = {
                    clarification: 'clarification',
                    clarify: 'clarification',
                    followup: 'followup_question',
                    follow_up: 'followup_question',
                    followup_question: 'followup_question',
                    action: 'action_suggestion',
                    action_suggestion: 'action_suggestion',
                    quick_response: 'quick_response',
                    quick: 'quick_response',
                    question: 'question',
                    agreement: 'agreement',
                    scheduling: 'scheduling',
                    task: 'task',
                    thanks: 'thanks',
                    confirm: 'confirm',
                    acknowledge: 'acknowledge',
                    small_talk: 'small_talk'
                };
                return map[t] || 'quick_response';
            };

            const storedSuggestions = await Promise.all(
                suggestions.map(async (suggestion) => {
                    const suggestionType = normalizeType(suggestion.suggestionType);
                    return await MessageSuggestion.create({
                        chatContext: currentMessage,
                        sender: userId,
                        [isGroup ? 'group' : 'recipient']: chatId,
                        suggestion: suggestion.suggestion,
                        suggestionType,
                        category: suggestion.category || 'other',
                        context: {
                            messageHistory: context.map(msg => String(msg.content)),
                            lastUserMessage: currentMessage,
                            conversationTone: suggestion.tone || 'professional'
                        }
                    });
                })
            );

            return res.status(200).json({
                success: true,
                suggestions: storedSuggestions
            });
        } catch (error) {
            console.error('Error generating message suggestions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate suggestions',
                error: error.message
            });
        }
    },

    // Get relevant suggestions for the current context
    getSuggestions: async (req, res) => {
        try {
            const { currentMessage, chatId, isGroup } = req.body;
            const userId = req.id;

            // Find relevant unused suggestions
            const suggestions = await MessageSuggestion.find({
                sender: userId,
                [isGroup ? 'group' : 'recipient']: chatId,
                used: false,
                chatContext: { $regex: currentMessage, $options: 'i' }
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

    // Mark a suggestion as used
    markSuggestionUsed: async (req, res) => {
        try {
            const { suggestionId } = req.body;
            await MessageSuggestion.findByIdAndUpdate(suggestionId, {
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

module.exports = MessageSuggestionController;
