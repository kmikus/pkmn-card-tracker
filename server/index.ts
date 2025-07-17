import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client'
import cors from 'cors';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Type definitions
interface User {
  id: string;
  displayName: string;
  email: string;
}

// Prisma types (matching actual database structure)
type PrismaUser = {
  id: string;
  displayname: string | null;
  email: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Extend Express User interface
declare global {
  namespace Express {
    interface User {
      id: string;
      displayName: string;
      email: string;
    }
  }
}

const app = express();
const prisma = new PrismaClient();

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

// Passport config
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id }
    });
    if (user) {
      done(null, { 
        id: user.id, 
        displayName: user.displayname || '', 
        email: user.email || '' 
      });
    } else {
      done(null, null);
    }
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  callbackURL: CALLBACK_URL!,
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  console.log('GoogleStrategy profile:', profile);
  try {
    // Save user to DB if not exists
    const user = await prisma.users.upsert({
      where: { id: profile.id },
      update: {},
      create: {
        id: profile.id,
        displayname: profile.displayName,
        email: profile.emails[0].value
      }
    });
    done(null, { id: user.id, displayName: user.displayname, email: user.email });
  } catch (error) {
    done(error);
  }
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
  if (!req.user) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
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
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}

// Get user info from token
app.get('/auth/user', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Get all cards in collection for logged-in user
app.get('/collection', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const cards = await prisma.collection.findMany({
      where: { userid: req.user.id }
    });
    
    const formattedCards = cards.map((card: any) => {
      const cardData = JSON.parse(card.data || '{}');
      return {
        id: card.id,
        name: card.name,
        set: { 
          id: cardData.set?.id || card.setname, // Use set ID from stored data, fallback to name
          name: cardData.set?.name || card.setname 
        },
        images: { small: card.image },
        ...cardData
      };
    });
    res.json(formattedCards);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add a card to collection for logged-in user
app.post('/collection', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const card = req.body;
    await prisma.collection.upsert({
      where: {
        id_userid: {
          id: card.id,
          userid: req.user.id
        }
      },
      update: {
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      },
      create: {
        id: card.id,
        userid: req.user.id,
        name: card.name,
        setname: card.set?.name || '',
        image: card.images?.small || '',
        data: JSON.stringify(card)
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding card to collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Remove a card from collection for logged-in user
app.delete('/collection/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    await prisma.collection.deleteMany({
      where: {
        id: req.params.id,
        userid: req.user.id
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message });
});

const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 