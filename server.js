// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch'); // node-fetch v2 を使用

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const WEBHOOK_URL = process.env.WEBHOOK_URL;
if (!WEBHOOK_URL) {
    console.error('WEBHOOK_URL is not defined in environment variables');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // フロントエンドの静的ファイル配信

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

app.post('/api/send-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        
        const formData = new FormData();
        formData.append('file', req.file.buffer, 'image.png');
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Discord API error: ${response.statusText}`);
        }
        
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

// package.json
const fs = require('fs');
fs.writeFileSync('package.json', JSON.stringify({
    "name": "vercel-webhook-server",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "vercel": "vercel deploy --prod"
    },
    "dependencies": {
        "dotenv": "^16.0.3",
        "express": "^4.18.2",
        "multer": "^1.4.5-lts.1",
        "node-fetch": "^2.6.7"
    }
}, null, 2));

// vercel.json
fs.writeFileSync('vercel.json', JSON.stringify({
    "version": 2,
    "builds": [
        { "src": "server.js", "use": "@vercel/node" },
        { "src": "public/index.html", "use": "@vercel/static" }
    ],
    "routes": [
        { "src": "/api/(.*)", "dest": "server.js" },
        { "src": "(.*)", "dest": "/public/index.html" }
    ]
}, null, 2));

