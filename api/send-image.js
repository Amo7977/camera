import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const WEBHOOK_URL = process.env.WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        return res.status(400).json({ error: 'Webhook URLが設定されていません' });
    }

    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: '画像処理に失敗しました' });
        }

        const filePath = files.file[0].filepath;
        const fileStream = fs.createReadStream(filePath);

        const formData = new FormData();
        formData.append('file', fileStream, 'image.png');

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData,
            });

            return res.json({ message: '画像が送信されました' });
        } catch (error) {
            return res.status(500).json({ error: '画像送信に失敗しました' });
        }
    });
}
