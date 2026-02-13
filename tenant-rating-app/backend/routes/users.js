const express = require('express');
const { pool } = require('../db');

const router = express.Router();

/**
 * GET /api/users/search
 * Query params: city (optional – omit or empty = return all), user_type (optional)
 * Response: { users: [...] }
 */
router.get('/search', async (req, res) => {
  try {
    const city = (req.query.city || '').trim();
    const userType = (req.query.user_type || '').toLowerCase();

    let query = `
      SELECT id, name, email, user_type, city, avg_rating, review_count
      FROM users
    `;
    const params = [];
    const conditions = [];

    if (city) {
      params.push(`%${city}%`);
      conditions.push(`(city ILIKE $${params.length} OR name ILIKE $${params.length})`);
    }
    if (userType === 'landlord' || userType === 'tenant') {
      params.push(userType);
      conditions.push(`user_type = $${params.length}`);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY review_count DESC NULLS LAST, avg_rating DESC NULLS LAST';

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error('GET /api/users/search error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/users/:id
 * Response: { user: {...}, reviews: [...] }
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    const userResult = await pool.query(
      `SELECT id, name, email, user_type, city, avg_rating, review_count
       FROM users WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    const reviewsResult = await pool.query(
      `SELECT id, title, description, rating, created_at, reviewer_id
       FROM reviews
       WHERE reviewed_user_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({ user, reviews: reviewsResult.rows });
  } catch (err) {
    console.error('GET /api/users/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
