/**
 * server.js  –  Next-Start Up Conclave 2026
 *
 * Endpoints:
 *   POST /register         – Student registration (college email only)
 *   POST /contact          – Contact form
 *   POST /subscribe        – Newsletter subscription (college email only)
 *   GET  /admin/stats      – Stats dashboard          [requires X-Admin-Key]
 *   GET  /admin/download-excel – Download Excel sheet [requires X-Admin-Key]
 *   POST /admin/notify     – Blast update to subscribers [requires X-Admin-Key]
 *
 * Start:
 *   npm install
 *   cp .env.example .env   # fill in SMTP + ADMIN_KEY
 *   node server.js
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Serve frontend from /public ── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── Routes ── */
app.use('/register',  require('./routes/register'));
app.use('/contact',   require('./routes/contact'));
app.use('/subscribe', require('./routes/subscribe'));
app.use('/admin',     require('./routes/admin'));

/* ── Catch-all: serve index.html for SPA-style navigation ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Start ── */
/*const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Next-Start Up Conclave backend running at http://localhost:${PORT}\n`);
  console.log('  POST /register              – Student registration');
  console.log('  POST /contact               – Contact form');
  console.log('  POST /subscribe             – Newsletter subscription');
  console.log('  GET  /admin/stats           – Dashboard stats      [X-Admin-Key]');
  console.log('  GET  /admin/download-excel  – Download Excel       [X-Admin-Key]');
  console.log('  POST /admin/notify          – Notify subscribers   [X-Admin-Key]\n');
});*/
module.exports = app;
