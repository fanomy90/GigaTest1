import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

// Промежуточное ПО для включения CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Добавлен заголовок Authorization
    next();
});

// Обработчик OPTIONS запроса для предварительных запросов
app.options('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Добавлен заголовок Authorization
    res.sendStatus(200);
});

// Обработчик POST запроса
app.post('/api/v2/oauth', async (req, res) => {
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    try {
        const response = await axios.post(apiUrl, req.body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
                'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
            },
        });

        res.header('Content-Type', 'application/json');
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Прокси-сервер слушает на http://localhost:${port}`);
});
