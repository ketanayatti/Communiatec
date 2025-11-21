const express = require('express');
const router = express.Router();
const AISuggestionController = require('../controllers/AISuggestionController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

router.use(AuthMiddleware);

// Generate new suggestions
router.post('/generate', AISuggestionController.generateSuggestions);

// Get existing suggestions
router.post('/get', AISuggestionController.getSuggestions);

// Mark suggestion as used
router.post('/mark-used', AISuggestionController.markSuggestionUsed);

module.exports = router;
