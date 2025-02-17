export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { ip } = req.body;
    const WEBHOOK_URL = process.env.WEBHOOK_URL;

    if (!ip || !WEBHOOK_URL) {
        return res.status(400).json({ error: 'IPアドレスまたはWebhook URLが不足しています' });
    }

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `IPアドレス: ${ip}` }),
        });

        return res.json({ message: 'IPアドレスが送信されました' });
    } catch (error) {
        return res.status(500).json({ error: 'IPアドレス送信に失敗しました' });
    }
}
