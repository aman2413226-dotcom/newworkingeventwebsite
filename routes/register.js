/**
 * routes/register.js
 * Handles student registration, saves to JSON + auto-updates Excel sheet.
 */

const express  = require('express');
const router   = express.Router();
const { readJSON, writeJSON, REGISTRATIONS_FILE } = require('../utils/dataStore');
const { updateExcel }   = require('../utils/excelExport');
const { sendMail }      = require('../utils/mailer');
const { isCollegeEmail, TICKET_LABELS } = require('../utils/validators');

/* POST /register */
router.post('/', async (req, res) => {
  const { name, email, college, year, ticket, phone } = req.body;

  // ── Validation ──
  if (!name || !email || !college || !year || !ticket) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  if (!isCollegeEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Only college emails accepted (e.g. @college.ac.in, @university.edu). Please use your institutional email.',
    });
  }

  // ── Duplicate check ──
  const registrations = readJSON(REGISTRATIONS_FILE);
  if (registrations.find(r => r.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      message: 'This email is already registered. Check your inbox for the confirmation email.',
    });
  }

  // ── Save record ──
  const record = {
    id:           Date.now().toString(),
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    college:      college.trim(),
    year:         year.trim(),
    ticket,
    ticketLabel:  TICKET_LABELS[ticket] || ticket,
    phone:        (phone || '').trim(),
    registeredAt: new Date().toISOString(),
  };

  registrations.push(record);
  writeJSON(REGISTRATIONS_FILE, registrations);

  // ── Update Excel sheet ──
  try {
    updateExcel(registrations);
  } catch (excelErr) {
    console.error('[Excel] Failed to update sheet:', excelErr.message);
  }

  // ── Send confirmation email to student ──
  try {
    await sendMail({
      to:      record.email,
      subject: '🎉 Registration Confirmed – Next-Start Up Conclave 2026',
      html:    registrationEmailHtml(record),
    });
  } catch (emailErr) {
    console.error('[Email] Confirmation send failed:', emailErr.message);
    return res.json({ success: true, message: 'Registered! (Confirmation email may be delayed — check spam.)' });
  }

  // ── Notify admin ──
  try {
    await sendMail({
      to:      process.env.ADMIN_EMAIL,
      subject: `New Registration: ${name} (${college} – ${year})`,
      text:    `Name: ${name}\nEmail: ${email}\nCollege: ${college}\nYear: ${year}\nTicket: ${record.ticketLabel}\nPhone: ${phone || 'N/A'}\nTime: ${record.registeredAt}`,
    });
  } catch (_) { /* non-critical */ }

  return res.json({ success: true, message: 'Registration successful! A confirmation has been sent to ' + email });
});

/* ── Email HTML template ── */
function registrationEmailHtml({ name, email, college, year, ticketLabel }) {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#0D0D0D;font-family:'Helvetica Neue',Arial,sans-serif;color:#F0F0F0}
  .wrap{max-width:600px;margin:0 auto;background:#111}
  .header{background:#E02020;padding:40px;text-align:center}
  .header h1{margin:0;font-size:2rem;letter-spacing:2px;color:#fff}
  .header p{margin:8px 0 0;color:rgba(255,255,255,.8);font-size:.85rem;letter-spacing:.1em}
  .body{padding:40px}
  .body h2{font-size:1.4rem;color:#F0F0F0;margin-bottom:12px}
  .body p{color:#aaa;line-height:1.7;font-size:.95rem;margin-bottom:16px}
  .box{background:#1A1A1A;border-left:4px solid #E02020;padding:24px 28px;margin:28px 0;border-radius:2px}
  .box h3{margin:0 0 16px;color:#E02020;text-transform:uppercase;font-size:.75rem;letter-spacing:.15em}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #222;font-size:.9rem}
  .row:last-child{border-bottom:none}
  .lbl{color:#888}.val{color:#F0F0F0;font-weight:600}
  .footer{background:#0D0D0D;padding:28px 40px;text-align:center;border-top:1px solid #1a1a1a}
  .footer p{color:#555;font-size:.8rem;margin:4px 0}
  .footer a{color:#E02020;text-decoration:none}
</style>
</head><body>
<div class="wrap">
  <div class="header">
    <h1>NEXT-START UP CONCLAVE</h1>
    <p>MUMBAI · APRIL 12–13, 2026</p>
  </div>
  <div class="body">
    <h2>You're registered, ${name}! 🚀</h2>
    <p>Your spot at the Next-Start Up Conclave 2026 is confirmed. We're thrilled to have you join 1,000+ founders, investors, and innovators in Mumbai.</p>
    <div class="box">
      <h3>Your Registration Details</h3>
      <div class="row"><span class="lbl">Name</span><span class="val">${name}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${email}</span></div>
      <div class="row"><span class="lbl">College</span><span class="val">${college}</span></div>
      <div class="row"><span class="lbl">Year of Study</span><span class="val">${year}</span></div>
      <div class="row"><span class="lbl">Ticket</span><span class="val">${ticketLabel}</span></div>
      <div class="row"><span class="lbl">Venue</span><span class="val">Mumbai Convention Centre, BKC</span></div>
    </div>
    <p><strong>What to bring:</strong> Your student ID and this confirmation email.</p>
    <p>Questions? Reply to this email or write to <a href="mailto:info@nexus.com" style="color:#E02020">info@nexus.com</a>.</p>
  </div>
  <div class="footer">
    <p>Next-Start Up Conclave 2026 · Mumbai Convention Centre</p>
    <p><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a></p>
  </div>
</div>
</body></html>`;
}

module.exports = router;
