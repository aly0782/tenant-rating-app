const express = require('express');
const { pool } = require('../db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/reviews (protected)
 * Body: { reviewed_user_id, rating, title, description }
 * Review a PERSON. is_verified = false until they approve.
 */
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { reviewed_user_id, rating, title, description } = req.body;
    if (!reviewed_user_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'reviewed_user_id and rating (1-5) are required',
      });
    }
    const rid = parseInt(reviewed_user_id, 10);
    if (Number.isNaN(rid)) {
      return res.status(400).json({ error: 'Invalid reviewed_user_id' });
    }
    if (rid === req.user.id) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, title, description, is_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, reviewer_id, reviewed_user_id, rating, title, description, is_verified, created_at`,
      [req.user.id, rid, rating, title?.trim() || null, description?.trim() || null]
    );
    const row = result.rows[0];
    res.status(201).json({
      review: {
        id: row.id,
        reviewer_id: row.reviewer_id,
        reviewed_user_id: row.reviewed_user_id,
        rating: row.rating,
        title: row.title,
        description: row.description,
        is_verified: row.is_verified,
        created_at: row.created_at,
      },
    });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'User not found' });
    console.error('POST /api/reviews error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reviews/:id/approve (protected)
 * Only the reviewed person can approve. Then recalc their avg_rating and review_count.
 */
router.put('/:id/approve', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid review id' });

    const reviewResult = await pool.query(
      'SELECT id, reviewed_user_id FROM reviews WHERE id = $1',
      [id]
    );
    if (reviewResult.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    if (reviewResult.rows[0].reviewed_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the person who was reviewed can approve it' });
    }

    await pool.query('UPDATE reviews SET is_verified = true WHERE id = $1', [id]);

    const uid = req.user.id;
    const avgResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating, COUNT(*)::int AS review_count
       FROM reviews WHERE reviewed_user_id = $1 AND is_verified = true`,
      [uid]
    );
    const { avg_rating, review_count } = avgResult.rows[0];
    await pool.query(
      'UPDATE users SET avg_rating = $1, review_count = $2 WHERE id = $3',
      [avg_rating, review_count, uid]
    );

    res.json({ status: 'approved' });
  } catch (err) {
    console.error('PUT /api/reviews/:id/approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reviews/:id/reject (protected)
 * Only the reviewed person can reject. We delete the review to keep it simple.
 */
router.put('/:id/reject', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid review id' });

    const reviewResult = await pool.query(
      'SELECT id, reviewed_user_id FROM reviews WHERE id = $1',
      [id]
    );
    if (reviewResult.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    if (reviewResult.rows[0].reviewed_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the person who was reviewed can reject it' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    const uid = req.user.id;
    const avgResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating, COUNT(*)::int AS review_count
       FROM reviews WHERE reviewed_user_id = $1 AND is_verified = true`,
      [uid]
    );
    const { avg_rating, review_count } = avgResult.rows[0];
    await pool.query(
      'UPDATE users SET avg_rating = $1, review_count = $2 WHERE id = $3',
      [avg_rating, review_count, uid]
    );

    res.json({ status: 'rejected' });
  } catch (err) {
    console.error('PUT /api/reviews/:id/reject error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/users/me/pending-reviews (protected)
 * Reviews about the current user that are not yet approved.
 */
async function getPendingReviewsForUser(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.title, r.description, r.created_at,
              u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewed_user_id = $1 AND r.is_verified = false
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
module.exports.getPendingReviewsForUser = getPendingReviewsForUser;
