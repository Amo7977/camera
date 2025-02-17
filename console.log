form.parse(req, async (err, fields, files) => {
    if (err) {
        return res.status(500).json({ error: '画像処理に失敗しました' });
    }

    console.log(files); // デバッグ用

    if (!files.file || files.file.length === 0) {
        return res.status(400).json({ error: 'ファイルが送信されていません' });
    }

    const file = files.file[0];
});

