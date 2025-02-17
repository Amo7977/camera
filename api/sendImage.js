import { IncomingForm } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  bodyParser: false, // これ重要！ファイルアップロード対応
};

const webhookUrl = process.env.WEBHOOK_URL;

exports.handler = async (event) => {
  return new Promise((resolve) => {
    const form = new IncomingForm();

    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error('ファイル解析エラー:', err);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'ファイル解析エラー' }),
        });
        return;
      }

      const file = files.file?.[0];
      if (!file) {
        console.error('ファイルが見つからない:', files);
        resolve({
          statusCode: 400,
          body: JSON.stringify({ error: '画像ファイルが見つかりません' }),
        });
        return;
      }

      const filePath = file.filepath;

      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), 'image.png');
        formData.append('content', '画像を送信します！');

        const discordRes = await fetch(webhookUrl, {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders(),
        });

        if (!discordRes.ok) {
          const errorBody = await discordRes.text();
          console.error('画像送信失敗:', discordRes.status, discordRes.statusText, errorBody);
          throw new Error(`画像送信失敗: ${discordRes.statusText}`);
        }

        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        });
      } catch (error) {
        console.error('画像送信エラー:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
  });
};
