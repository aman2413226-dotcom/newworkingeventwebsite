/**
 * utils/dataStore.js
 * Simple JSON file-based data store.
 * Swap readJSON/writeJSON for a real DB call in production.
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const SUBSCRIBERS_FILE   = path.join(DATA_DIR, 'subscribers.json');
const CONTACTS_FILE      = path.join(DATA_DIR, 'contacts.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJSON, writeJSON, REGISTRATIONS_FILE, SUBSCRIBERS_FILE, CONTACTS_FILE };
