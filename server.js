require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Serve static files ── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ── */
app.use('/register',  require('./routes/register'));
app.use('/contact',   require('./routes/contact'));
app.use('/subscribe', require('./routes/subscribe'));
app.use('/admin',     require('./routes/admin'));

/* ── Catch-all (avoid breaking JS/CSS) ── */
app.get('*', (req, res) => {
  if (req.path.startsWith('/js') || req.path.startsWith('/css')) {
    return res.status(404).end();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── Export for Vercel ── */
module.exports = app;
