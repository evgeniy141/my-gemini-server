const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Простые настройки CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString()
    });
});

// Gemini API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, systemInstruction } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Сообщение обязательно' });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            systemInstruction: systemInstruction || "Ты полезный ассистент"
        });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        
        res.json({
            text: response.text(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
app.get('/', (req, res) => {
    res.send('Сервер работает! Добро пожаловать!');
});

// Можно также добавить простой HTML
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Мой сервер</title></head>
            <body>
                <h1>Сервер работает! 🎉</h1>
                <p>Телефон успешно подключился к серверу</p>
            </body>
        </html>
    `);
});
app.listen(3000, '0.0.0.0', () => {
    console.log('✓ Сервер запущен на порту 3000');
    console.log('✓ Локальный: http://localhost:3000');
    console.log('✓ Сеть: http://192.168.0.103:3000');
});

// Функция для получения IP
function getIPAddress() {
    const interfaces = require('os').networkInterfaces();
    for (const name in interfaces) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}