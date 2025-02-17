require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // CORSを許可
app.use(express.json());

app.get('/webhook', (req, res) => {
  res.json({ webhookUrl: process.env.WEBHOOK_URL });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
