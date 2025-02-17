require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const upload = multer();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.error('WEBHOOK_URL is not defined in .env');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/send-message', async (req, res) => {
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

app.post('/send-image', upload.single('file'), async (req, res) => {
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

module.exports = app;

// vercel.json
const fs = require('fs');
fs.writeFileSync('vercel.json', JSON.stringify({
    "version": 2,
    "builds": [{ "src": "server.js", "use": "@vercel/node" }],
    "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}, null, 2));

// package.json
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
