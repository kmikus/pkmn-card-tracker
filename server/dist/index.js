"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Initialize PostgreSQL database
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        displayName TEXT,
        email TEXT
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS collection (
        id TEXT,
        userId TEXT,
        name TEXT,
        setName TEXT,
        image TEXT,
        data TEXT,
        PRIMARY KEY (id, userId),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
        console.log('Database tables initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
}
initializeDatabase();
// Passport config
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    }
    catch (err) {
        done(err);
    }
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    console.log('GoogleStrategy profile:', profile);
    try {
        // Save user to DB if not exists
        await pool.query('INSERT INTO users (id, displayName, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [profile.id, profile.displayName, profile.emails[0].value]);
        done(null, { id: profile.id, displayName: profile.displayName, email: profile.emails[0].value });
    }
    catch (error) {
        done(error);
    }
}));
app.use(passport_1.default.initialize());
// Auth routes
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', (req, res, next) => {
    console.log('Google OAuth callback hit. Query:', req.query);
    next();
}, passport_1.default.authenticate('google', {
    failureRedirect: '/',
    session: false, // Don't use sessions
}), (req, res) => {
    console.log('Google OAuth success. User:', req.user);
    if (!req.user) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, displayName: req.user.displayName, email: req.user.email }, JWT_SECRET, { expiresIn: '24h' });
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
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
}
// Get user info from token
app.get('/auth/user', requireAuth, (req, res) => {
    res.json({ user: req.user });
});
// Get all cards in collection for logged-in user
app.get('/collection', requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const result = await pool.query('SELECT * FROM collection WHERE userId = $1', [req.user.id]);
        const cards = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            set: { name: row.setname },
            images: { small: row.image },
            ...JSON.parse(row.data)
        }));
        res.json(cards);
    }
    catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: error.message });
    }
});
// Add a card to collection for logged-in user
app.post('/collection', requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const card = req.body;
        await pool.query('INSERT INTO collection (id, userId, name, setName, image, data) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id, userId) DO UPDATE SET name = $3, setName = $4, image = $5, data = $6', [card.id, req.user.id, card.name, card.set?.name || '', card.images?.small || '', JSON.stringify(card)]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error adding card to collection:', error);
        res.status(500).json({ error: error.message });
    }
});
// Remove a card from collection for logged-in user
app.delete('/collection/:id', requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        await pool.query('DELETE FROM collection WHERE id = $1 AND userId = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error removing card from collection:', error);
        res.status(500).json({ error: error.message });
    }
});
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ error: err.message });
});
const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
