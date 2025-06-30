import express from 'express';
import axios from 'axios';
import * as https from 'https';
import fs from 'fs';

//import debug from 'debug';
//const log = debug('proxy-server');

const app = express();
const port = 3000;
let token = null;
// Загрузка SSL-сертификата
const certPath = 'C:\\Users\\skiner\\Documents\\OUTERHEAVEN\\russian_trusted_root_ca.cer';
const certBuffer = fs.readFileSync(certPath);

// Middleware для включения CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware для обработки данных формы
app.use(express.urlencoded({ extended: true }));

// Middleware для включения CORS для HEAD запроса
app.head('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Middleware для включения CORS для OPTIONS запроса
app.options('/api/v2/oauth', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID');
    res.sendStatus(200);
});

// Middleware для обработки POST запроса
app.post('/api/v2/oauth', async (req, res) => {
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

    try {
        // Использование HTTPS агента с загруженным сертификатом
        const agent = new https.Agent({ ca: certBuffer });

        const formData = new URLSearchParams();
        formData.append('scope', 'GIGACHAT_API_PERS');

        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
                'Authorization': 'token',
            },
            httpsAgent: agent,
        });

        res.header('Content-Type', 'application/json');
        res.json(response.data.access_token);
        token = response.data.access_token
    } catch (error) {
        console.error('Error in proxy request:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Middleware для включения CORS для HEAD запроса
app.head('/api/v1/chat/completions', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Middleware для включения CORS для OPTIONS запроса
app.options('/api/v1/chat/completions', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID');
    res.sendStatus(200);
});

app.post('/api/v1/chat/completions', async (req, res) => {
    //получение токена
    //const token = req.body.token;
    const content = req.body.request;
    const content2 = 'скажи что нибудь для теста';
    console.log('передача данных прокси серверу', content2)
    //реализация запроса с токеном к GigaChat
    const apiUrl2 = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
    try {
        //обработка текста запросом в GigaChat
        const requestData = {
            model: 'GigaChat:latest',
            messages: [
                {
                    role: 'user',
                    content: content2,
                },
            ],
            temperature: 1.0,
            top_p: 0.1,
            n: 1,
            stream: false,
            max_tokens: 512,
            repetition_penalty: 1,
        };
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        const axiosConfig = {
            headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        };
        //сборка и выполнение запроса
        const response = await axios.post(apiUrl2, requestData, axiosConfig);
        
        //возврат результата
        res.header('Content-Type', 'application/json');
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Proxy server is listening at http://localhost:${port}`);
});
