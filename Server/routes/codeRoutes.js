const express = require('express');
const { createSession, joinSession } = require('../controllers/CodeController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.post('/create-session', AuthMiddleware, createSession);
router.get('/join/:sessionId', AuthMiddleware, joinSession);


module.exports = router;
