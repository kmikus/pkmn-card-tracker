require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

const PORT = process.env.PORT || 4000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('CALLBACK_URL:', process.env.CALLBACK_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.set('trust proxy', 1);
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./collection.db', (err) => {
  if (err) return console.error('DB open error:', err.message);
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    displayName TEXT,
    email TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS collection (
    id TEXT,
    userId TEXT,
    name TEXT,
    setName TEXT,
    image TEXT,
    data TEXT,
    PRIMARY KEY (id, userId),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
});

// Passport config
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return done(err);
    done(null, row);
  });
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  console.log('GoogleStrategy profile:', profile);
  // Save user to DB if not exists
  db.run(
    'INSERT OR IGNORE INTO users (id, displayName, email) VALUES (?, ?, ?)',
    [profile.id, profile.displayName, profile.emails[0].value],
    (err) => {
      if (err) return done(err);
      done(null, { id: profile.id, displayName: profile.displayName, email: profile.emails[0].value });
    }
  );
}));

app.use(passport.initialize());

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', (req, res, next) => {
  console.log('Google OAuth callback hit. Query:', req.query);
  next();
}, passport.authenticate('google', {
  failureRedirect: '/',
  session: false, // Don't use sessions
}), (req, res) => {
  console.log('Google OAuth success. User:', req.user);
  // Generate JWT token
  const token = jwt.sign(
    { id: req.user.id, displayName: req.user.displayName, email: req.user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
});

app.get('/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Middleware to verify JWT token
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get user info from token
app.get('/auth/user', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Get all cards in collection for logged-in user
app.get('/collection', requireAuth, (req, res) => {
  db.all('SELECT * FROM collection WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const cards = rows.map(row => ({
      id: row.id,
      name: row.name,
      set: { name: row.setName },
      images: { small: row.image },
      ...JSON.parse(row.data)
    }));
    res.json(cards);
  });
});

// Add a card to collection for logged-in user
app.post('/collection', requireAuth, (req, res) => {
  const card = req.body;
  db.run(
    'INSERT OR REPLACE INTO collection (id, userId, name, setName, image, data) VALUES (?, ?, ?, ?, ?, ?)',
    [card.id, req.user.id, card.name, card.set?.name || '', card.images?.small || '', JSON.stringify(card)],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Remove a card from collection for logged-in user
app.delete('/collection/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM collection WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 