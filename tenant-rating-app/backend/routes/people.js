const express = require('express');
const { pool } = require('../db');

const router = express.Router();

/**
 * GET /api/people/search?city=lisbon&user_type=landlord|tenant
 * List people (landlords/tenants) in a city. user_type optional (both if omitted).
 */
router.get('/search', async (req, res) => {
  try {
    const city = (req.query.city || '').trim();
    const userType = (req.query.user_type || '').toLowerCase();

    if (!city) {
      return res.status(400).json({ error: 'Query param "city" is required' });
    }

    let query = `
      SELECT id, name, email, user_type, city, avg_rating, review_count, avatar_url, is_verified
      FROM users
      WHERE LOWER(city) = LOWER($1)
    `;
    const params = [city];

    if (userType === 'landlord' || userType === 'tenant') {
      query += ` AND user_type = $2`;
      params.push(userType);
    }

    query += ` ORDER BY review_count DESC NULLS LAST, name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/people/search error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/people/:id
 * Person profile + reviews they received (as reviewed_user_id).
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    const userResult = await pool.query(
      `SELECT id, name, email, user_type, city, avg_rating, review_count, avatar_url, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const person = userResult.rows[0];

    const reviewsResult = await pool.query(
      `SELECT r.id, r.rating, r.title, r.description, r.is_verified, r.created_at, r.rental_history_id,
              u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewed_user_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    const reviews = reviewsResult.rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      description: r.description,
      is_verified: r.is_verified,
      created_at: r.created_at,
      rental_history_id: r.rental_history_id,
      reviewer: { name: r.reviewer_name, avatar: r.reviewer_avatar },
    }));

    res.json({ person, reviews });
  } catch (err) {
    console.error('GET /api/people/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
