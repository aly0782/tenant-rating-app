const express = require('express');
const { pool } = require('../db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/properties/search?city=lisbon
 * Returns list of properties in that city.
 */
router.get('/search', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).json({ error: 'Query param "city" is required' });
    }
    const result = await pool.query(
      `SELECT id, address, city, postal_code, property_type, landlord_id, avg_rating, review_count
       FROM properties
       WHERE LOWER(city) = LOWER($1)
       ORDER BY created_at DESC`,
      [city.trim()]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/properties/search error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/properties/:id
 * Single property with reviews (reviewer name, avatar) and landlord (name, email).
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid property id' });

    const propResult = await pool.query(
      'SELECT id, address, city, postal_code, property_type, landlord_id, avg_rating, review_count, created_at FROM properties WHERE id = $1',
      [id]
    );
    if (propResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const property = propResult.rows[0];

    const landlordResult = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [property.landlord_id]
    );
    const landlord = landlordResult.rows[0] ? { name: landlordResult.rows[0].name, email: landlordResult.rows[0].email } : null;

    const reviewsResult = await pool.query(
      `SELECT r.id, r.rating, r.title, r.description, r.is_verified, r.created_at,
              u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.property_id = $1
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
      reviewer: { name: r.reviewer_name, avatar: r.reviewer_avatar },
    }));

    res.json({ property, landlord, reviews });
  } catch (err) {
    console.error('GET /api/properties/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/properties (protected)
 * Body: { address, city, postal_code, property_type }
 * landlord_id = req.user.id
 */
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { address, city, postal_code, property_type } = req.body;
    if (!address || !city) {
      return res.status(400).json({ error: 'address and city are required' });
    }
    const result = await pool.query(
      `INSERT INTO properties (address, city, postal_code, property_type, landlord_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, address, city, postal_code, property_type, landlord_id, avg_rating, review_count, created_at`,
      [address.trim(), city.trim(), postal_code?.trim() || null, property_type?.trim() || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/properties error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
