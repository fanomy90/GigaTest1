import https from 'https';
import axios from 'axios';
//import * as path from 'path';
import * as fs from 'fs';

async function getAccessToken() {
    const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
        'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
    };

    const data = {
        scope: 'GIGACHAT_API_PERS',
    };
    //работа с сертификатом
    const certBuffer = fs.readFileSync('C:\\Users\\skiner\\Documents\\OUTERHEAVEN\\russian_trusted_root_ca.cer');
    //создание агента с сертификатом
    const axiosConfig = {
        httpsAgent: new https.Agent({
            ca: certBuffer,
        }),
    };

    axios.post(apiUrl, new URLSearchParams(data), { headers, ...axiosConfig })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
}

export { getAccessToken };
