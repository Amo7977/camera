export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let data;
    try {
        data = await new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => resolve(JSON.parse(body)));
            req.on('error', reject);
        });
    } catch (error) {
        return res.status(400).json({ error: 'リクエストボディの解析に失敗しました' });
    }

    const { ip } = data;
    const WEBHOOK_URL = process.env.WEBHOOK_URL;

    if (!ip || !WEBHOOK_URL) {
        return res.status(400).json({ error: 'IPアドレスまたはWebhook URLが不足しています' });
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `IPアドレス: ${ip}` }),
        });

        if (!response.ok) {
            throw new Error(`Webhook送信に失敗しました: ${response.statusText}`);
        }

        return res.json({ message: 'IPアドレスが送信されました' });
    } catch (error) {
        return res.status(500).json({ error: `IPアドレス送信に失敗しました: ${error.message}` });
    }
}
