import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { TagService } from '../services/tagService';
import { User } from '../types';

const router = Router();
const tagService = new TagService();

// Toggle favorite tag on a card
router.post('/favorite/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const cardId = req.params.cardId;

    // Check if card is already favorited
    const isFavorited = await tagService.cardHasTag(user.id, cardId, 'favorite');
    
    if (isFavorited) {
      // Remove favorite
      await tagService.removeTagFromCard(user.id, cardId, 'favorite');
      res.json({ success: true, favorited: false });
    } else {
      // Add favorite
      await tagService.addTagToCard(user.id, cardId, 'favorite');
      res.json({ success: true, favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Toggle wishlist tag on a card
router.post('/wishlist/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const cardId = req.params.cardId;

    // Check if card is already wishlisted
    const isWishlisted = await tagService.cardHasTag(user.id, cardId, 'wishlist');
    
    if (isWishlisted) {
      // Remove from wishlist
      await tagService.removeTagFromCard(user.id, cardId, 'wishlist');
      res.json({ success: true, wishlisted: false });
    } else {
      // Add to wishlist
      await tagService.addTagToCard(user.id, cardId, 'wishlist');
      res.json({ success: true, wishlisted: true });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get tag status for a card
router.get('/status/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const cardId = req.params.cardId;

    const [isFavorited, isWishlisted] = await Promise.all([
      tagService.cardHasTag(user.id, cardId, 'favorite'),
      tagService.cardHasTag(user.id, cardId, 'wishlist')
    ]);

    res.json({
      favorited: isFavorited,
      wishlisted: isWishlisted
    });
  } catch (error) {
    console.error('Error getting tag status:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get all tags for a card
router.get('/card/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const user = (req as any).user as User;
    const cardId = req.params.cardId;

    const cardTags = await tagService.getCardTags(user.id, cardId);
    res.json(cardTags.map(ct => ct.tag));
  } catch (error) {
    console.error('Error getting card tags:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router; 