import { Router, Response, Request } from 'express';
import { requireAuth } from '../middleware/auth';
import { CollectionService } from '../services/collectionService';
import { User } from '../types';

const router = Router();
const collectionService = new CollectionService();

// Get all cards in collection for logged-in user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const cards = await collectionService.getUserCollection(user.id);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add a card to collection for logged-in user
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const card = req.body;
    await collectionService.addCardToCollection(user.id, card);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding card to collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Remove a card from collection for logged-in user
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    await collectionService.removeCardFromCollection(user.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router; 