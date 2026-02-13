const express = require('express');
const { pool } = require('../db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/reviews (protected)
 * Body: { property_id, rating, title, description, rental_start_date?, rental_end_date? }
 * is_verified = false (pending landlord approval)
 */
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { property_id, rating, title, description, rental_start_date, rental_end_date } = req.body;
    if (!property_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'property_id and rating (1-5) are required' });
    }
    const result = await pool.query(
      `INSERT INTO reviews (reviewer_id, property_id, rating, title, description, is_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id`,
      [req.user.id, property_id, rating, title?.trim() || null, description?.trim() || null]
    );
    res.status(201).json({ id: result.rows[0].id, status: 'pending_approval' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Property not found' });
    console.error('POST /api/reviews error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reviews/:id/approve (protected, landlord only)
 */
router.put('/:id/approve', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid review id' });

    const reviewResult = await pool.query(
      'SELECT r.id, r.property_id, p.landlord_id FROM reviews r JOIN properties p ON p.id = r.property_id WHERE r.id = $1',
      [id]
    );
    if (reviewResult.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    if (reviewResult.rows[0].landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the property landlord can approve this review' });
    }

    await pool.query('UPDATE reviews SET is_verified = true, rejection_reason = NULL WHERE id = $1', [id]);
    res.json({ status: 'approved' });
  } catch (err) {
    console.error('PUT /api/reviews/:id/approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reviews/:id/reject (protected, landlord only)
 * Body: { reason? }
 */
router.put('/:id/reject', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid review id' });

    const reviewResult = await pool.query(
      'SELECT r.id, r.property_id, p.landlord_id FROM reviews r JOIN properties p ON p.id = r.property_id WHERE r.id = $1',
      [id]
    );
    if (reviewResult.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    if (reviewResult.rows[0].landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the property landlord can reject this review' });
    }

    const reason = req.body?.reason?.trim() || null;
    try {
      await pool.query(
        'UPDATE reviews SET is_verified = false, rejection_reason = $2 WHERE id = $1',
        [id, reason]
      );
    } catch (e) {
      await pool.query('UPDATE reviews SET is_verified = false WHERE id = $1', [id]);
    }
    res.json({ status: 'rejected' });
  } catch (err) {
    console.error('PUT /api/reviews/:id/reject error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/users/me/pending-reviews (protected)
 * Returns reviews awaiting approval for current user's properties.
 */
async function getPendingReviewsForLandlord(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.property_id, r.rating, r.title, r.description, r.created_at,
              p.address, p.city,
              u.name AS reviewer_name, u.email AS reviewer_email
       FROM reviews r
       JOIN properties p ON p.id = r.property_id
       JOIN users u ON u.id = r.reviewer_id
       WHERE p.landlord_id = $1 AND r.is_verified = false
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/users/me/pending-reviews error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = router;
module.exports.getPendingReviewsForLandlord = getPendingReviewsForLandlord;
