const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/posts  — create a new post
router.post('/', auth, async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }
  if (content.length > 280) {
    return res.status(400).json({ error: 'Post must be 280 characters or fewer' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING id, content, created_at`,
      [req.userId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/feed  — posts from followed users + own posts
router.get('/feed', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.username
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1
          OR p.user_id IN (
            SELECT following_id FROM follows WHERE follower_id = $1
          )
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
