require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const WEBHOOK_URL = process.env.WEBHOOK_URL;
if (!WEBHOOK_URL) {
    console.error('WEBHOOK_URL is not defined in environment variables');
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
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `IP: ${ip}\nMessage: ${message}` })
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
        
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: 'image.png', contentType: req.file.mimetype });
        formData.append('payload_json', JSON.stringify({ content: `IP: ${ip}` }));
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
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

