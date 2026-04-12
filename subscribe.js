/**
 * routes/subscribe.js
 */

const express = require('express');
const router  = express.Router();
const { readJSON, writeJSON, SUBSCRIBERS_FILE } = require('../utils/dataStore');
const { sendMail }      = require('../utils/mailer');
const { isCollegeEmail } = require('../utils/validators');

/* POST /subscribe */
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  if (!isCollegeEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Only college email addresses are accepted for updates.',
    });
  }

  const subscribers = readJSON(SUBSCRIBERS_FILE);
  if (subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'This email is already subscribed.' });
  }

  subscribers.push({ email: email.toLowerCase(), subscribedAt: new Date().toISOString() });
  writeJSON(SUBSCRIBERS_FILE, subscribers);

  // Welcome email
  try {
    await sendMail({
      to:      email,
      subject: "✅ You're subscribed – Next-Start Up Conclave 2026 Updates",
      html: `
        <div style="background:#0D0D0D;color:#F0F0F0;font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px">
          <h2 style="color:#E02020">You're in! 🚀</h2>
          <p style="color:#aaa;line-height:1.7">You've subscribed to updates for the <strong style="color:#F0F0F0">Next-Start Up Conclave 2026</strong>.</p>
          <p style="color:#aaa;line-height:1.7">Event: <strong style="color:#F0F0F0">April 12–13, 2026</strong> · Mumbai Convention Centre</p>
          <p style="color:#555;font-size:.8rem;margin-top:32px">You can unsubscribe at any time by replying to this email.</p>
        </div>`,
    });
  } catch (err) {
    console.error('[Subscribe] Welcome email failed:', err.message);
  }

  return res.json({ success: true, message: `Subscribed! Updates will be sent to ${email}` });
});

module.exports = router;
