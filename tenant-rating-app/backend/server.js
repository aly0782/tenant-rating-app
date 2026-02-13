require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const { getPendingReviewsForUser } = require('./routes/reviews');
const { verifyJWT } = require('./middleware/auth');

const app = express();
const PORT = 5001;

console.log('📍 Starting server...');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://teal-macaron-8d7a65.netlify.app',
    'https://v0-tenant-landlord-platform-olive.vercel.app',
  ],
  credentials: true,
}));
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
app.get('/api/users/me/pending-reviews', verifyJWT, getPendingReviewsForUser);

app.use('/api/users', usersRoutes);

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
