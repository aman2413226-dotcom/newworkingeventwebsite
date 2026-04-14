/* =====================================================
   REGISTRATION FORM → POST /register
===================================================== */
async function handleRegister(e) {
  if (e) e.preventDefault();

  const name = getVal('regName');
  const email = getVal('regEmail');
  const college = getVal('regCollege');
  const year = getVal('regYear');
  const ticket = getVal('regTicket');
  const phone = getVal('regPhone');

  if (!name || !email || !college || !year || !ticket) {
    showMsg('regMsg', 'error', 'Please fill in all required fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg('regMsg', 'error', 'Please enter a valid email address.');
    return;
  }

  if (!/(\.edu|\.ac\.in)$/i.test(email)) {
    showMsg('regMsg', 'error', 'Please use a valid college email ending in .edu or .ac.in.');
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
      showMsg(
        'regMsg',
        'success',
        data.message || 'Registration successful! Check your email for confirmation.'
      );
      clearFields(['regName', 'regEmail', 'regCollege', 'regYear', 'regTicket', 'regPhone']);
    } else {
      showMsg('regMsg', 'error', data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showMsg(
      'regMsg',
      'error',
      'Could not reach the server. Please check your connection or contact support.'
    );
  } finally {
    setBtn('regBtn', false, 'Register Now →');
  }
}
