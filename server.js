require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDB } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Allow requests from the GitHub Pages frontend only
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth',  require('./auth'));
app.use('/api/posts', require('./posts'));
app.use('/api/users', require('./users'));

// Health check — Railway/Render ping this to confirm the server is alive
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Start
initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`MiniSocial API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
