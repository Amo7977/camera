const webhookUrl = process.env.WEBHOOK_URL;

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { content } = JSON.parse(event.body);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`送信失敗: ${response.statusText}`);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
