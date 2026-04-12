/**
 * utils/dataStore.js
 * Safe for Vercel (serverless) + works locally
 */

const fs   = require('fs');
const path = require('path');

// Detect if running on Vercel
const isServerless = !!process.env.VERCEL;

// In-memory fallback (for Vercel)
let memoryStore = {
  registrations: [],
  subscribers: [],
  contacts: []
};

const DATA_DIR = path.join(__dirname, '..', 'data');

let REGISTRATIONS_FILE, SUBSCRIBERS_FILE, CONTACTS_FILE;

if (!isServerless) {
  // Only create folder locally
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
  SUBSCRIBERS_FILE   = path.join(DATA_DIR, 'subscribers.json');
  CONTACTS_FILE      = path.join(DATA_DIR, 'contacts.json');
}

function readJSON(file) {
  if (isServerless) {
    // Return from memory
    if (file.includes('registrations')) return memoryStore.registrations;
    if (file.includes('subscribers')) return memoryStore.subscribers;
    if (file.includes('contacts')) return memoryStore.contacts;
    return [];
  }

  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  if (isServerless) {
    // Save in memory instead of filesystem
    if (file.includes('registrations')) memoryStore.registrations = data;
    if (file.includes('subscribers')) memoryStore.subscribers = data;
    if (file.includes('contacts')) memoryStore.contacts = data;
    return;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readJSON,
  writeJSON,
  REGISTRATIONS_FILE,
  SUBSCRIBERS_FILE,
  CONTACTS_FILE
};
