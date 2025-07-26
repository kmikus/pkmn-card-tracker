import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// TCG API base URL
const TCG_API_URL = 'https://api.pokemontcg.io/v2';

// Type definitions matching TCG API response structure
interface TCGSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

interface TCGResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Get all card sets
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await axios.get<TCGResponse<TCGSet>>(`${TCG_API_URL}/sets`, {
      params: {
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 250
      }
    });

    // Return the exact same structure as TCG API
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching sets:', error.message);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// Get a specific set by ID
router.get('/:setId', async (req: Request, res: Response) => {
  try {
    const { setId } = req.params;
    
    if (!setId) {
      res.status(400).json({ error: 'Set ID is required' });
      return;
    }

    const response = await axios.get<TCGSet>(`${TCG_API_URL}/sets/${setId}`);

    // Return the exact same structure as TCG API
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching set by ID:', error.message);
    res.status(500).json({ error: 'Failed to fetch set' });
  }
});

export default router; 