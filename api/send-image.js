import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
    api: {
        bodyParser: false,  // formidable を使うため無効化
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

        const file = files.file[0];  // formidable から取得
        const fileStream = fs.createReadStream(file.filepath);

        const formData = new FormData();
        formData.append('file', fileStream, 'image.png');

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Webhook送信に失敗しました: ${response.statusText}`);
            }

            return res.json({ message: '画像が送信されました' });
        } catch (error) {
            return res.status(500).json({ error: `画像送信に失敗しました: ${error.message}` });
        }
    });
}
