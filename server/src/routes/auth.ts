import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
import { requireAuth } from '../middleware/auth';
import { User } from '../types';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

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

// Google OAuth strategy
passport.use(new (require('passport-google-oauth20').Strategy)({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.CALLBACK_URL!,
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

// Auth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
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

router.get('/logout', (req, res) => {
  res.json({ success: true });
});

// Get user info from token
router.get('/user', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({ user });
});

export default router; 