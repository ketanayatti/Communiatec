const express = require('express');
const router = express.Router();
const MessageSuggestionController = require('../controllers/MessageSuggestionController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

router.use(AuthMiddleware);

// Generate new suggestions
router.post('/generate', MessageSuggestionController.generateSuggestions);

// Get existing suggestions
router.post('/get', MessageSuggestionController.getSuggestions);

// Mark suggestion as used
router.post('/mark-used', MessageSuggestionController.markSuggestionUsed);

module.exports = router;
