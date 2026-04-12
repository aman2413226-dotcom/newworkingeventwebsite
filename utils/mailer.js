/**
 * utils/mailer.js
 * Nodemailer transporter wrapper.
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"Next-Start Up Conclave 2026" <${process.env.SMTP_USER}>`;

/**
 * sendMail({ to, subject, html?, text?, replyTo? })
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP credentials not set — skipping email to', to);
    return;
  }
  return transporter.sendMail({ from: FROM, to, subject, html, text, replyTo });
}

module.exports = { sendMail };
