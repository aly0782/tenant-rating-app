require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const reviewsRoutes = require('./routes/reviews');
const { getPendingReviewsForLandlord } = require('./routes/reviews');
const { verifyJWT } = require('./middleware/auth');

const app = express();
const PORT = 5001;

console.log('📍 Starting server...');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  console.log('🔔 Health endpoint hit');
  res.json({ status: 'Server running', time: new Date() });
});

app.get('/api/db/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    res.json({ user_count: result.rows[0].count });
  } catch (err) {
    console.error('❌ /api/db/test error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/api/me', verifyJWT, (req, res) => {
  res.json(req.user);
});

app.get('/api/users/me/pending-reviews', verifyJWT, getPendingReviewsForLandlord);

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
