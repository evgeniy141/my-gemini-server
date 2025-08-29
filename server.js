require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const responseCache = new Map(); // Кэш ответов

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Проверка кэша
        const cacheKey = message.toLowerCase().trim();
        if (responseCache.has(cacheKey)) {
            console.log('Возвращаем из кэша:', cacheKey);
            return res.json(responseCache.get(cacheKey));
        }

        // ИСПОЛЬЗУЕМ GEMINI-1.0-PRO - больше лимитов
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
        const result = await model.generateContent(message);
        const response = await result.response;
        
        const responseData = {
            success: true,
            response: response.text(),
            cached: false
        };
        
        // Сохраняем в кэш на 1 час
        responseCache.set(cacheKey, { ...responseData, cached: true });
        setTimeout(() => responseCache.delete(cacheKey), 60 * 60 * 1000);
        
        res.json(responseData);
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message.includes('429') || error.message.includes('quota')) {
            res.status(429).json({
                success: false,
                error: 'Достигнут лимит запросов. Попробуйте через 5 минут.',
                details: 'Бесплатный тариф Gemini имеет ограничения'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
