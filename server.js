require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

// Fallback responses
const fallbackResponses = {
    'привет': 'Здравствуйте! Я ваш космический гид 🌌',
    'совет': 'Сегодня - прекрасный день для новых начинаний! ✨',
    'настроение': 'Помните: каждая тучина проходит, и наступает ясный день 🌤️',
    'таро': 'Карты таро говорят: время перемен и новых возможностей! 🔮',
    'сон': 'Сны - это врата в подсознание. Записывайте их для лучшего понимания. 🌙',
    'энергия': 'Ваша энергия - как океан. Иногда спокойный, иногда бурный. 🌊',
    'размышления': 'Что бы вы сделали, если бы знали, что не можете потерпеть неудачу? 💫'
};

// Simple chat API
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.json({ 
                success: false, 
                error: 'Message is required' 
            });
        }

        const messageLower = message.toLowerCase().trim();
        
        // Return fallback response
        if (fallbackResponses[messageLower]) {
            return res.json({
                success: true,
                response: fallbackResponses[messageLower],
                fallback: true
            });
        }
        
        // Default response
        res.json({
            success: true,
            response: `Вы сказали: "${message}". Сервер работает в тестовом режиме. ✅`,
            fallback: false
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            error: 'Server error',
            fallback: false
        });
    }
});

// Test endpoint
app.post('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Тест успешен!',
        received: req.body 
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});

