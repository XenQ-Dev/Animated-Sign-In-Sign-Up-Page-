/**
 * Slider Login UI — Express + SQLite auth backend.
 *
 * - Serves the static frontend from ./public
 * - POST /api/signup   { username, email, password }
 * - POST /api/login    { email, password }
 * - POST /api/logout
 * - GET  /api/me       -> current user (from httpOnly JWT cookie)
 *
 * On boot it seeds an admin account (admin@test.com / admin123, role "admin").
 */
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite'); // built-in SQLite (Node 22.5+)

const PORT = process.env.PORT || 5510;
// Dev-only secret. For production, set JWT_SECRET in the environment.
const JWT_SECRET = process.env.JWT_SECRET || 'slider-login-ui-dev-secret-change-me';
const COOKIE = 'auth';

// ── Database ────────────────────────────────────────────────────────────
const db = new DatabaseSync(path.join(__dirname, 'data.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'user',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

const q = {
  byEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  byUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  byId: db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?'),
  insert: db.prepare(
    'INSERT INTO users (username, email, password_hash, role) VALUES (@username, @email, @password_hash, @role)'
  ),
};

// ── Seed the admin account ──────────────────────────────────────────────
function seedAdmin() {
  const email = 'admin@test.com';
  if (q.byEmail.get(email)) {
    console.log('[seed] admin already exists:', email);
    return;
  }
  const password_hash = bcrypt.hashSync('admin123', 10);
  q.insert.run({ username: 'admin', email, password_hash, role: 'admin' });
  console.log('[seed] created admin:', email, '(password: admin123)');
}
seedAdmin();

// ── Helpers ─────────────────────────────────────────────────────────────
const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, role: u.role });

function issueToken(res, user) {
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function currentUser(req) {
  const token = req.cookies[COOKIE];
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    return q.byId.get(id) || null;
  } catch {
    return null;
  }
}

const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// ── App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/api/signup', (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (q.byEmail.get(email)) return res.status(409).json({ error: 'That email is already registered.' });
  if (q.byUsername.get(username)) return res.status(409).json({ error: 'That username is taken.' });

  const password_hash = bcrypt.hashSync(password, 10);
  const info = q.insert.run({ username, email, password_hash, role: 'user' });
  const user = q.byId.get(Number(info.lastInsertRowid));
  issueToken(res, user);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/login', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = q.byEmail.get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password.' });

  issueToken(res, user);
  res.json({ user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ user: publicUser(user) });
});

// ── Static frontend ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Slider Login UI running at http://localhost:${PORT}`);
});
