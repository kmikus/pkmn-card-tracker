import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import cors from 'cors';
import passport from 'passport';

// Import routes
import authRoutes from './routes/auth';
import collectionRoutes from './routes/collection';
import tagRoutes from './routes/tags';
import cardsRoutes from './routes/cards';
import setsRoutes from './routes/sets';
import pokemonRoutes from './routes/pokemon';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

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

// Initialize passport
app.use(passport.initialize());

// Use routes
app.use('/auth', authRoutes);
app.use('/collection', collectionRoutes);
app.use('/tags', tagRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/sets', setsRoutes);
app.use('/api/pokemon', pokemonRoutes);

// Error handling middleware
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