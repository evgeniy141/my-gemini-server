require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Проверка работы сервера
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// API для нейросети
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    
    res.json({ 
      success: true,
      response: response.text() 
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Простой HTML интерфейс
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gemini AI Chat</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>🤖 Gemini AI Server is Running!</h1>
      <p>Use /api/chat endpoint for AI requests</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
