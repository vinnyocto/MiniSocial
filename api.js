// ── Config ──────────────────────────────────────────────
// Replace this with your deployed Railway/Render backend URL
const API_BASE = ''; // same Render app / same website

// ── Token helpers ────────────────────────────────────────
function getToken()  { return localStorage.getItem('ms_token'); }
function getUser()   { return JSON.parse(localStorage.getItem('ms_user') || 'null'); }
function saveAuth(token, username, userId) {
  localStorage.setItem('ms_token', token);
  localStorage.setItem('ms_user', JSON.stringify({ username, userId }));
}
function clearAuth() {
  localStorage.removeItem('ms_token');
  localStorage.removeItem('ms_user');
}
function isLoggedIn() { return !!getToken(); }

// ── API wrapper ──────────────────────────────────────────
async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth guard ───────────────────────────────────────────
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

function requireGuest() {
  if (isLoggedIn()) {
    window.location.href = 'feed.html';
  }
}

// ── Time formatting ──────────────────────────────────────
function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ── Avatar letter ────────────────────────────────────────
function avatarLetter(username) {
  return username ? username[0].toUpperCase() : '?';
}
