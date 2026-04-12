require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Serve static files ── */
/*app.use(express.static(path.join(__dirname)));*/
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ── */
app.use('/register', require('./routes/register'));
app.use('/contact', require('./routes/contact'));
app.use('/subscribe', require('./routes/subscribe'));
app.use('/admin', require('./routes/admin'));

/* ── Catch-all (IMPORTANT FIX) ── */
/*app.get('*', (req, res, next) => {
  // If it's a file request (.js, .css, .png, etc), don't send index.html
  if (path.extname(req.path)) {
    return next();
  }*/
/* ── Catch-all (IMPORTANT FIX) ── */
app.get('*', (req, res, next) => {
  // If it's a file request (.js, .css, .png, etc), don't send index.html
  if (path.extname(req.path)) return next();
  
  // Send the index.html from the public folder
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Export for Vercel ── */
module.exports = app;
