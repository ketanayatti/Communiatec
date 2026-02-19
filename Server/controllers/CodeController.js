const CodeSession = require('../models/CodeSessionModel');

// Real-time code collaboration only; execution removed.

const createSession = async (req, res) => {
  try {
    const { title, language, isPublic } = req.body;

    // Reuse an existing session if one with the same title already exists
    let session = await CodeSession.findOne({ title });

    if (!session) {
      const sessionId = Math.random().toString(36).substring(2, 15);
      session = new CodeSession({
        sessionId,
        title,
        language: language || 'javascript',
        isPublic: isPublic || false,
        createdBy: req.user.id
      });
      await session.save();
    }

    return res.status(201).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        title: session.title,
        language: session.language,
        code: session.code,
        participants: session.participants
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await CodeSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        title: session.title,
        language: session.language,
        code: session.code,
        participants: session.participants
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSession,
  joinSession
};
