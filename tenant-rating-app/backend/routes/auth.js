const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { verifyGoogleToken } = require('../auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES = '24h';

/**
 * POST /api/auth/google
 * Body: { idToken }
 * Returns: { token, user: { id, email, name } }
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const googleUser = await verifyGoogleToken(idToken);
    const { email, name, picture, googleId } = googleUser;

    const existing = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await pool.query(
        'UPDATE users SET google_id = $1, name = $2, avatar_url = $3, updated_at = NOW() WHERE id = $4',
        [googleId, name, picture || null, user.id]
      );
    } else {
      const insert = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name`,
        [googleId, email, name, picture || null]
      );
      user = insert.rows[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('POST /api/auth/google error:', err);
    res.status(401).json({ error: err.message || 'Invalid Google token' });
  }
});

module.exports = router;
