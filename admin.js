/**
 * routes/admin.js
 * Protected admin endpoints.
 * All require the header:  X-Admin-Key: <your ADMIN_KEY>
 */

const express = require('express');
const router  = express.Router();
const path    = require('path');
const { readJSON, REGISTRATIONS_FILE, SUBSCRIBERS_FILE, CONTACTS_FILE } = require('../utils/dataStore');
const { updateExcel, EXCEL_FILE } = require('../utils/excelExport');
const { sendMail }                = require('../utils/mailer');

/* ── Auth middleware ── */
function requireKey(req, res, next) {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  next();
}

router.use(requireKey);

/* GET /admin/stats */
router.get('/stats', (req, res) => {
  const registrations = readJSON(REGISTRATIONS_FILE);
  const subscribers   = readJSON(SUBSCRIBERS_FILE);
  const contacts      = readJSON(CONTACTS_FILE);

  const byTicket = registrations.reduce((acc, r) => {
    acc[r.ticket] = (acc[r.ticket] || 0) + 1;
    return acc;
  }, {});

  const byYear = registrations.reduce((acc, r) => {
    acc[r.year || 'Unknown'] = (acc[r.year || 'Unknown'] || 0) + 1;
    return acc;
  }, {});

  return res.json({
    registrations: registrations.length,
    subscribers:   subscribers.length,
    contacts:      contacts.length,
    byTicket,
    byYear,
    recent: registrations.slice(-10).reverse().map(r => ({
      name: r.name, college: r.college, year: r.year,
      ticket: r.ticketLabel || r.ticket, at: r.registeredAt,
    })),
  });
});

/* GET /admin/download-excel  – download the registrations Excel */
router.get('/download-excel', (req, res) => {
  const registrations = readJSON(REGISTRATIONS_FILE);
  try {
    updateExcel(registrations); // refresh before download
  } catch (_) {}
  res.download(EXCEL_FILE, 'registrations.xlsx', (err) => {
    if (err) res.status(500).json({ success: false, message: 'Could not send file.' });
  });
});

/* POST /admin/notify  – blast update to all subscribers */
router.post('/notify', async (req, res) => {
  const { subject, message, adminName } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'subject and message are required.' });
  }

  const subscribers = readJSON(SUBSCRIBERS_FILE);
  if (subscribers.length === 0) {
    return res.json({ success: true, sent: 0, message: 'No subscribers yet.' });
  }

  let sent = 0, failed = 0;
  const BATCH = 10;

  for (let i = 0; i < subscribers.length; i += BATCH) {
    await Promise.allSettled(
      subscribers.slice(i, i + BATCH).map(async sub => {
        try {
          await sendMail({
            to:      sub.email,
            subject: `🔔 ${subject} – Next-Start Up Conclave 2026`,
            html:    notifyHtml(subject, message, adminName),
          });
          sent++;
        } catch { failed++; }
      })
    );
    if (i + BATCH < subscribers.length) await delay(500);
  }

  return res.json({ success: true, sent, failed, total: subscribers.length });
});

/* ── Helpers ── */
const delay = ms => new Promise(r => setTimeout(r, ms));

function notifyHtml(subject, message, adminName) {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#0D0D0D;font-family:'Helvetica Neue',Arial,sans-serif;color:#F0F0F0}
  .wrap{max-width:600px;margin:0 auto;background:#111}
  .header{background:linear-gradient(135deg,#A01010,#E02020);padding:36px 40px;text-align:center}
  .header h1{margin:0;font-size:1.8rem;letter-spacing:2px;color:#fff}
  .body{padding:40px}
  .body h2{font-size:1.3rem;color:#F0F0F0;margin-bottom:16px}
  .body p{color:#aaa;line-height:1.8;font-size:.95rem;margin-bottom:14px}
  .msg{background:#1A1A1A;border-left:4px solid #E02020;padding:24px 28px;margin:24px 0;border-radius:2px;color:#ddd;line-height:1.8}
  .footer{background:#0D0D0D;padding:28px 40px;text-align:center;border-top:1px solid #1a1a1a}
  .footer p{color:#555;font-size:.8rem;margin:4px 0}
  .footer a{color:#E02020;text-decoration:none}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>NEXT-START UP CONCLAVE</h1></div>
  <div class="body">
    <h2>${subject}</h2>
    <p>Hi there! Here's the latest update from the Conclave team:</p>
    <div class="msg">${message.replace(/\n/g, '<br>')}</div>
    <p>We can't wait to see you in Mumbai!</p>
    <p style="color:#555;font-size:.85rem">— ${adminName || 'The Conclave Team'}</p>
  </div>
  <div class="footer">
    <p>Next-Start Up Conclave 2026 · Mumbai Convention Centre</p>
    <p>You're receiving this because you subscribed with your college email.</p>
    <p><a href="#">Unsubscribe</a></p>
  </div>
</div></body></html>`;
}

module.exports = router;
