const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

console.log('📍 Starting server...');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  console.log('🔔 Health endpoint hit');
  res.json({ status: 'Server running', time: new Date() });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server LISTENING on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});
