/**
 * routes/contact.js
 */

const express = require('express');
const router  = express.Router();
const { readJSON, writeJSON, CONTACTS_FILE } = require('../utils/dataStore');
const { sendMail } = require('../utils/mailer');

/* POST /contact */
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  // Save contact enquiry
  const contacts = readJSON(CONTACTS_FILE);
  contacts.push({ name, email, subject, message, at: new Date().toISOString() });
  writeJSON(CONTACTS_FILE, contacts);

  // Forward to admin
  try {
    await sendMail({
      to:      process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html:    `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p>${message.replace(/\n/g, '<br>')}</p>`,
    });
  } catch (err) {
    console.error('[Contact] Email forward failed:', err.message);
  }

  return res.json({ success: true, message: "Message received! We'll get back to you within 24 hours." });
});

module.exports = router;
