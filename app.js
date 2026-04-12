/* =====================================================
   NEXT-START UP CONCLAVE 2026 — Frontend JS
   Talks to the Node.js backend via fetch() API.
   No EmailJS needed — server handles all emails.
===================================================== */

/* ── Backend base URL ── */
/*const API_BASE = 'http://localhost:3001';*/
const API_BASE = '';
/* =====================================================
   NAVBAR SCROLL
===================================================== */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.style.background = window.scrollY > 50
    ? 'rgba(13,13,13,0.98)'
    : 'rgba(13,13,13,0.92)';
});

/* =====================================================
   HAMBURGER MENU
===================================================== */
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });
}

function closeMobile() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.remove('open');
}

/* =====================================================
   SCROLL REVEAL
===================================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =====================================================
   COUNTDOWN TIMER  (April 12, 2026 09:00 IST)
===================================================== */
const eventDate = new Date('2026-04-12T09:00:00+05:30');

function updateCountdown() {
  const diff = eventDate - new Date();
  const ids = ['cd-days', 'cd-hrs', 'cd-min', 'cd-sec'];
  if (diff <= 0) {
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '00'; });
    return;
  }
  const vals = [
    Math.floor(diff / 86400000),
    Math.floor((diff % 86400000) / 3600000),
    Math.floor((diff % 3600000) / 60000),
    Math.floor((diff % 60000) / 1000),
  ];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(vals[i]).padStart(2, '0');
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* =====================================================
   HELPERS
===================================================== */
function showMsg(id, type, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-msg ' + type;
  el.textContent = text;
  el.classList.remove('hidden');
  // Auto-hide after 8s
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 8000);
}

function setBtn(btnId, loading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : label;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function clearFields(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* =====================================================
   REGISTRATION FORM  →  POST /register
===================================================== */
async function handleRegister() {
  const name    = getVal('regName');
  const email   = getVal('regEmail');
  const college = getVal('regCollege');
  const year    = getVal('regYear');
  const ticket  = getVal('regTicket');
  const phone   = getVal('regPhone');

  // — Client-side validation —
  if (!name || !email || !college || !year || !ticket) {
    showMsg('regMsg', 'error', 'Please fill in all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg('regMsg', 'error', 'Please enter a valid email address.');
    return;
  }

  setBtn('regBtn', true, '');

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, college, year, ticket, phone }),
    });

    const data = await res.json();

    if (data.success) {
      showMsg('regMsg', 'success', data.message || 'Registration successful! Check your email for confirmation.');
      clearFields(['regName', 'regEmail', 'regCollege', 'regYear', 'regTicket', 'regPhone']);
    } else {
      showMsg('regMsg', 'error', data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showMsg('regMsg', 'error', 'Could not reach the server. Please check your connection or contact info@nexus.com.');
  } finally {
    setBtn('regBtn', false, 'Register Now →');
  }
}

/* =====================================================
   CONTACT FORM  →  POST /contact
===================================================== */
async function handleContact() {
  const name    = getVal('ctName');
  const email   = getVal('ctEmail');
  const subject = getVal('ctSubject');
  const message = getVal('ctMsg');

  if (!name || !email || !subject || !message) {
    showMsg('contactMsg', 'error', 'Please fill in all fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg('contactMsg', 'error', 'Please enter a valid email address.');
    return;
  }

  setBtn('ctBtn', true, '');

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await res.json();

    if (data.success) {
      showMsg('contactMsg', 'success', "Message sent! We'll get back to you within 24 hours.");
      clearFields(['ctName', 'ctEmail', 'ctSubject', 'ctMsg']);
    } else {
      showMsg('contactMsg', 'error', data.message || 'Could not send message. Please try again.');
    }
  } catch (err) {
    console.error('Contact error:', err);
    showMsg('contactMsg', 'error', 'Could not reach the server. Please email us at info@nexus.com.');
  } finally {
    setBtn('ctBtn', false, 'Send Message →');
  }
}

/* =====================================================
   SUBSCRIBE  →  POST /subscribe
===================================================== */
async function handleSubscribe() {
  const email = getVal('subEmail');

  if (!email) {
    showMsg('subMsg', 'error', 'Please enter your email address.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      showMsg('subMsg', 'success', "Subscribed! You'll receive event updates at " + email);
      clearFields(['subEmail']);
    } else {
      showMsg('subMsg', 'error', data.message || 'Could not subscribe. Please try again.');
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    showMsg('subMsg', 'error', 'Server unreachable. Please try again later.');
  }
}
