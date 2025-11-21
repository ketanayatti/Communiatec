const express = require('express');
const router = express.Router();
const GeminiController = require('../controllers/GeminiController');
const verifyToken = require('../middlewares/AuthMiddleware');

// Route to get AI response
router.post('/chat', verifyToken, GeminiController.generateAIResponse);

module.exports = router;
