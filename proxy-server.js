import express from 'express';
import axios from 'axios';
const app = express();
const port = 3000;
app.use(express.json());
// Промежуточное ПО для включения CORS
app.head('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Обработчик OPTIONS запроса
app.options('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
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
                'Authorization': 'token',
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
