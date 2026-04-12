# Next-Start Up Conclave 2026 — Setup Guide

## What's New in v2.0
- ✅ Registration form **actually works** (was broken — EmailJS placeholder key was never replaced)
- ✅ **Year of Study** field added to registration form
- ✅ **Excel sheet** auto-generated at `data/registrations.xlsx` on every registration
- ✅ Proper **folder structure** — routes, utils, and public assets separated
- ✅ All emails handled by **Node.js backend** (no browser SDK needed)
- ✅ Admin endpoint to **download Excel** at any time

---

## Folder Structure

```
conclave/
├── server.js               ← Entry point
├── package.json
├── .env.example            ← Copy to .env and fill in
├── .gitignore
│
├── public/                 ← Frontend (served statically)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── routes/                 ← Express route handlers
│   ├── register.js         ← POST /register
│   ├── contact.js          ← POST /contact
│   ├── subscribe.js        ← POST /subscribe
│   └── admin.js            ← GET|POST /admin/*
│
├── utils/                  ← Shared utilities
│   ├── dataStore.js        ← JSON read/write helpers
│   ├── mailer.js           ← Nodemailer wrapper
│   ├── validators.js       ← Email domain validation
│   └── excelExport.js      ← Excel sheet generator
│
└── data/                   ← Auto-created on first run
    ├── registrations.json
    ├── registrations.xlsx  ← Auto-updated on each registration
    ├── subscribers.json
    └── contacts.json
```

---

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Open `.env` and fill in:
| Variable | Description |
|---|---|
| `SMTP_USER` | Your Gmail address (e.g. `event@gmail.com`) |
| `SMTP_PASS` | Gmail App Password (16 chars, see below) |
| `ADMIN_EMAIL` | Where admin notifications are sent |
| `ADMIN_KEY` | A secret string to protect admin endpoints |
| `PORT` | Server port (default: `3001`) |

### 3. Gmail App Password setup
1. Enable **2-Factor Authentication** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Create an App Password for "Mail"
4. Paste the 16-character password as `SMTP_PASS` (no spaces)

### 4. Start the server
```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

### 5. Open in browser
```
http://localhost:3001
```

---

## Registration Form Fields
| Field | Required | Notes |
|---|---|---|
| Full Name | ✅ | |
| College Email | ✅ | Must be `.edu`, `.ac.in`, etc. |
| College / University | ✅ | |
| **Year of Study** | ✅ | 1st–5th Year, PG, PhD |
| Ticket Type | ✅ | Day 1, Day 2, or Full Pass |
| Phone Number | ❌ | Optional |

---

## Excel Sheet

Every registration automatically updates `data/registrations.xlsx`.

The Excel file has **two sheets**:
- **Registrations** — full table with all fields, styled with red header, alternate row shading, auto-filters, and frozen header row
- **Summary** — total count, breakdown by ticket type, and breakdown by year of study

### Download Excel via Admin API
```bash
curl -H "X-Admin-Key: your-secret-key" \
     http://localhost:3001/admin/download-excel \
     --output registrations.xlsx
```

---

## Admin API

All admin endpoints require the header: `X-Admin-Key: <your ADMIN_KEY>`

### GET /admin/stats
Returns registration counts, ticket breakdown, year breakdown, and last 10 registrations.

```bash
curl -H "X-Admin-Key: your-key" http://localhost:3001/admin/stats
```

### GET /admin/download-excel
Downloads the latest `registrations.xlsx`.

### POST /admin/notify
Sends an update email to all subscribers.
```bash
curl -X POST http://localhost:3001/admin/notify \
  -H "X-Admin-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Schedule Update","message":"Day 1 schedule has been updated...","adminName":"Conclave Team"}'
```

---

## Supported College Email Domains
`.edu` `.ac.in` `.edu.in` `.ac.uk` `.ac.nz` `.ac.za` `.edu.au` `.ac.jp` `.edu.sg` `.ac.ae` `.edu.hk`

To add more domains, edit the `COLLEGE_DOMAINS` array in `utils/validators.js`.

---

## Why the Original Form Was Broken
The original `app.js` used the **EmailJS** browser SDK. There was a guard in the code:
```js
if (EMAILJS_PUBLIC_KEY === '_JUv2_BQ3U8SOq8yj') {
  // Demo mode — just logs to console, never actually sends
  return { status: 200 };
}
```
Since the placeholder key was never replaced, every submission silently "succeeded" without doing anything. The new version uses the Node.js backend directly via `fetch()`, so there's no SDK dependency in the browser.
