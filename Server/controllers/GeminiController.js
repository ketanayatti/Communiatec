const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GeminiController = {
  generateAIResponse: async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      // Use a supported model + stable API version
      const model = genAI.getGenerativeModel(
        { model: 'gemini-2.5-flash' },    // or 'gemini-2.5-pro'
        { apiVersion: 'v1' }
      );

      const result = await model.generateContent(message);
      const text = result.response.text();

      return res.status(200).json({ success: true, response: text });
    } catch (error) {
      console.error('Error generating AI response:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI response',
        error: {
          message: error.message,
          status: error.status,
          details: error.errorDetails
        }
      });
    }
  }
};

module.exports = GeminiController;
