import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// TCG API base URL
const TCG_API_URL = 'https://api.pokemontcg.io/v2';

// Type definitions matching TCG API response structure
interface TCGCard {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  attacks?: Array<{
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: {
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
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  regulationMark?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices: {
      holofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      reverseHolofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      normal?: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
      germanProLow: number;
      suggestedPrice: number;
      reverseHoloSell: number;
      reverseHoloLow: number;
      reverseHoloTrend: number;
      lowPriceExPlus: number;
      avg1: number;
      avg7: number;
      avg30: number;
      reverseHoloAvg1: number;
      reverseHoloAvg7: number;
      reverseHoloAvg30: number;
    };
  };
}

interface TCGResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Search cards by Pokémon name
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Pokémon name is required' });
    }

    const response = await axios.get<TCGResponse<TCGCard>>(`${TCG_API_URL}/cards`, {
      params: {
        q: `name:${name}`,
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 250
      }
    });

    // Return the exact same structure as TCG API
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching cards by name:', error.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get cards from a specific set
router.get('/set/:setId', async (req: Request, res: Response) => {
  try {
    const { setId } = req.params;
    
    if (!setId) {
      return res.status(400).json({ error: 'Set ID is required' });
    }

    const response = await axios.get<TCGResponse<TCGCard>>(`${TCG_API_URL}/cards`, {
      params: {
        q: `set.id:${setId}`,
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 250
      }
    });

    // Return the exact same structure as TCG API
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching cards by set:', error.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

export default router; 