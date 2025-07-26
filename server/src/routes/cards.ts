import { Router, Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// TCG API base URL (keeping for fallback)
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
      res.status(400).json({ error: 'Pokémon name is required' });
      return;
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 250;
    const skip = (page - 1) * pageSize;

    // Search cards in database by name (case-insensitive partial match)
    // Sort by release date in reverse chronological order (newest first)
    const cards = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      setname: string;
      image: string;
      data: string;
      created_at: Date;
    }>>`
      SELECT * FROM cards 
      WHERE name ILIKE ${`%${name}%`}
      ORDER BY (data::json->'set'->>'releaseDate') DESC, 
               CASE 
                 WHEN (data::json->>'number') ~ '^[0-9]+$' 
                 THEN CAST((data::json->>'number') AS INTEGER)
                 ELSE 999999
               END ASC,
               (data::json->>'number') ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    // Get total count for pagination
    const totalCount = await prisma.cards.count({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      }
    });

    // Parse JSON data and reconstruct TCG API response structure
    const tcgCards: TCGCard[] = cards.map((card: any) => {
      try {
        const cardData = JSON.parse(card.data || '{}');
        return cardData as TCGCard;
      } catch (error) {
        console.error(`Error parsing JSON for card ${card.id}:`, error);
        // Return a minimal card structure if JSON parsing fails
        return {
          id: card.id,
          name: card.name || '',
          images: {
            small: card.image || '',
            large: card.image || ''
          },
          set: {
            id: '',
            name: card.setname || '',
            series: '',
            printedTotal: 0,
            total: 0,
            releaseDate: '',
            updatedAt: '',
            images: {
              symbol: '',
              logo: ''
            }
          }
        } as TCGCard;
      }
    });

    // Return the exact same structure as TCG API
    const response: TCGResponse<TCGCard> = {
      data: tcgCards,
      page,
      pageSize,
      count: tcgCards.length,
      totalCount
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching cards by name from database:', error.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get cards from a specific set
router.get('/set/:setId', async (req: Request, res: Response) => {
  try {
    const { setId } = req.params;
    
    if (!setId) {
      res.status(400).json({ error: 'Set ID is required' });
      return;
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