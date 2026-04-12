/**
 * utils/validators.js
 */

const COLLEGE_DOMAINS = [
  '.edu', '.ac.in', '.edu.in', '.ac.uk', '.ac.nz',
  '.ac.za', '.edu.au', '.ac.jp', '.edu.sg', '.ac.ae', '.edu.hk',
];

function isCollegeEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return COLLEGE_DOMAINS.some(d => email.toLowerCase().includes(d));
}

const TICKET_LABELS = {
  day1: 'Day 1 Pass – April 12, 2026',
  day2: 'Day 2 Pass – April 13, 2026',
  full: 'Full Event Pass – April 12–13, 2026 (Best Value)',
};

module.exports = { isCollegeEmail, TICKET_LABELS, COLLEGE_DOMAINS };
