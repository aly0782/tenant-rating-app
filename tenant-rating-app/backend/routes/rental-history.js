const express = require('express');
const { pool } = require('../db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/rental-history (protected)
 * Create a rental record (proof that two people rented together).
 * Body: { other_user_id, property_address?, rental_start_date?, rental_end_date? }
 * Caller is either landlord or tenant; other_user_id is the other party.
 */
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { other_user_id, property_address, rental_start_date, rental_end_date } = req.body;
    if (!other_user_id || other_user_id === req.user.id) {
      return res.status(400).json({ error: 'other_user_id is required and must be different from you' });
    }

    const other = await pool.query('SELECT id, user_type FROM users WHERE id = $1', [other_user_id]);
    if (other.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const myType = req.user.user_type || 'tenant';
    const otherType = other.rows[0].user_type || 'landlord';
    let landlord_id, tenant_id;
    if (myType === 'landlord') {
      landlord_id = req.user.id;
      tenant_id = parseInt(other_user_id, 10);
    } else {
      tenant_id = req.user.id;
      landlord_id = parseInt(other_user_id, 10);
    }

    const result = await pool.query(
      `INSERT INTO rental_history (landlord_id, tenant_id, property_address, rental_start_date, rental_end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, landlord_id, tenant_id, property_address, rental_start_date, rental_end_date, status, created_at`,
      [
        landlord_id,
        tenant_id,
        property_address?.trim() || null,
        rental_start_date || null,
        rental_end_date || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'User not found' });
    console.error('POST /api/rental-history error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/**
 * GET /api/users/me/rental-history (protected)
 * List rental history where current user is landlord or tenant (for review form dropdown).
 */
async function getMyRentalHistory(req, res) {
  try {
    const result = await pool.query(
      `SELECT rh.id, rh.property_address, rh.rental_start_date, rh.rental_end_date, rh.status,
              u.id AS other_id, u.name AS other_name, u.user_type AS other_type
       FROM rental_history rh
       JOIN users u ON u.id = CASE WHEN rh.landlord_id = $1 THEN rh.tenant_id ELSE rh.landlord_id END
       WHERE rh.landlord_id = $1 OR rh.tenant_id = $1
       ORDER BY rh.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/users/me/rental-history error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports.getMyRentalHistory = getMyRentalHistory;
