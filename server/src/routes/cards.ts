import { Router, Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

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
    // Join with sets table to get release date for proper sorting
    // Sort by release date in reverse chronological order (newest first), then by card number
    const cards = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      setname: string;
      image: string;
      data: string;
      "setId": string;
      "cardNumber": string;
      "cardNumberInt": number | null;
      created_at: Date;
      "releaseDate": string | null;
    }>>`
      SELECT c.*, s."releaseDate"
      FROM cards c
      LEFT JOIN sets s ON c."setId" = s.id
      WHERE c.name ILIKE ${`%${name}%`}
      ORDER BY COALESCE(s."releaseDate", '1900-01-01') DESC, 
               COALESCE(c."cardNumberInt", 999999) ASC,
               c."cardNumber" ASC
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

    // Get set information for all cards
    const setIds = [...new Set(cards.map(card => card.setId))];
    const sets = await prisma.sets.findMany({
      where: {
        id: {
          in: setIds
        }
      }
    });
    const setMap = new Map(sets.map(set => [set.id, set]));

    // Parse JSON data and reconstruct TCG API response structure
    const tcgCards: TCGCard[] = cards.map((card: any) => {
      try {
        const cardData = JSON.parse(card.data || '{}');
        const setInfo = setMap.get(card.setId);
        
        // Construct the set object from our database structure
        const setObject = {
          id: card.setId || '',
          name: setInfo?.name || card.setname || '',
          series: setInfo?.series || '',
          printedTotal: setInfo?.printedTotal || 0,
          total: setInfo?.total || 0,
          ptcgoCode: setInfo?.ptcgoCode || undefined,
          releaseDate: setInfo?.releaseDate || '',
          updatedAt: setInfo?.updatedAt || '',
          images: {
            symbol: setInfo?.symbol || '',
            logo: setInfo?.logo || ''
          }
        };
        
        // Return the card with the constructed set object
        return {
          ...cardData,
          set: setObject
        } as TCGCard;
      } catch (error) {
        console.error(`Error parsing JSON for card ${card.id}:`, error);
        // Return a minimal card structure if JSON parsing fails
        const setInfo = setMap.get(card.setId);
        return {
          id: card.id,
          name: card.name || '',
          images: {
            small: card.image || '',
            large: card.image || ''
          },
          set: {
            id: card.setId || '',
            name: setInfo?.name || card.setname || '',
            series: setInfo?.series || '',
            printedTotal: setInfo?.printedTotal || 0,
            total: setInfo?.total || 0,
            releaseDate: setInfo?.releaseDate || '',
            updatedAt: setInfo?.updatedAt || '',
            images: {
              symbol: setInfo?.symbol || '',
              logo: setInfo?.logo || ''
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

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 250;
    const skip = (page - 1) * pageSize;

    // Search cards in database by set ID using indexed columns
    // Join with sets table to get set information
    // Sort by cardNumberInt first, then by cardNumber
    const cards = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      setname: string;
      image: string;
      data: string;
      "setId": string;
      "cardNumber": string;
      "cardNumberInt": number | null;
      created_at: Date;
      "releaseDate": string | null;
    }>>`
      SELECT c.*, s."releaseDate"
      FROM cards c
      LEFT JOIN sets s ON c."setId" = s.id
      WHERE c."setId" = ${setId}
      ORDER BY COALESCE(c."cardNumberInt", 999999) ASC, c."cardNumber" ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    // Get total count for pagination using indexed column
    const totalCountResult = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count FROM cards 
      WHERE "setId" = ${setId}
    `;
    const totalCount = Number(totalCountResult[0]?.count || 0);

    // Get set information for all cards
    const setIds = [...new Set(cards.map(card => card.setId))];
    const sets = await prisma.sets.findMany({
      where: {
        id: {
          in: setIds
        }
      }
    });
    const setMap = new Map(sets.map(set => [set.id, set]));

    // Parse JSON data and reconstruct TCG API response structure
    const tcgCards: TCGCard[] = cards.map((card: any) => {
      try {
        const cardData = JSON.parse(card.data || '{}');
        const setInfo = setMap.get(card.setId);
        
        // Construct the set object from our database structure
        const setObject = {
          id: card.setId || '',
          name: setInfo?.name || card.setname || '',
          series: setInfo?.series || '',
          printedTotal: setInfo?.printedTotal || 0,
          total: setInfo?.total || 0,
          ptcgoCode: setInfo?.ptcgoCode || undefined,
          releaseDate: setInfo?.releaseDate || '',
          updatedAt: setInfo?.updatedAt || '',
          images: {
            symbol: setInfo?.symbol || '',
            logo: setInfo?.logo || ''
          }
        };
        
        // Return the card with the constructed set object
        return {
          ...cardData,
          set: setObject
        } as TCGCard;
      } catch (error) {
        console.error(`Error parsing JSON for card ${card.id}:`, error);
        // Return a minimal card structure if JSON parsing fails
        const setInfo = setMap.get(card.setId);
        return {
          id: card.id,
          name: card.name || '',
          images: {
            small: card.image || '',
            large: card.image || ''
          },
          set: {
            id: card.setId || '',
            name: setInfo?.name || card.setname || '',
            series: setInfo?.series || '',
            printedTotal: setInfo?.printedTotal || 0,
            total: setInfo?.total || 0,
            releaseDate: setInfo?.releaseDate || '',
            updatedAt: setInfo?.updatedAt || '',
            images: {
              symbol: setInfo?.symbol || '',
              logo: setInfo?.logo || ''
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
    console.error('Error fetching cards by set from database:', error.message);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

export default router; 