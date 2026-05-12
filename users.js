const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users  — list all users except self, with follow status
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username,
              EXISTS (
                SELECT 1 FROM follows
                WHERE follower_id = $1 AND following_id = u.id
              ) AS is_following
       FROM users u
       WHERE u.id != $1
       ORDER BY u.username ASC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/:id/follow  — toggle follow/unfollow
router.post('/:id/follow', auth, async (req, res) => {
  const targetId = parseInt(req.params.id);

  if (targetId === req.userId) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    // Check if already following
    const existing = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.userId, targetId]
    );

    if (existing.rows.length > 0) {
      // Unfollow
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [req.userId, targetId]
      );
      res.json({ following: false });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [req.userId, targetId]
      );
      res.json({ following: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
