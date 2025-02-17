// server.js (修正後)
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

if (!WEBHOOK_URL || !IMGUR_CLIENT_ID) {
    console.error('環境変数 WEBHOOK_URL または IMGUR_CLIENT_ID が設定されていません');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/api', (req, res) => {
    res.send('API Server is running');
});

app.post('/api/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
        });
        
        if (!response.ok) {
            throw new Error(`Discord API error: ${response.statusText}`);
        }
        
        res.status(200).send('Message sent');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending message');
    }
});

app.post('/api/send-image', async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).send('No image provided');
        }
        
        const formData = new FormData();
        formData.append('image', req.body.image);
        
        const imgurResponse = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: { 'Authorization': `Client-ID ${IMGUR_CLIENT_ID}` },
            body: formData
        });
        
        const imgurData = await imgurResponse.json();
        if (!imgurData.success) {
            throw new Error('Imgur upload failed');
        }
        
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: imgurData.data.link })
        });
        
        res.status(200).send('Image sent');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending image');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

