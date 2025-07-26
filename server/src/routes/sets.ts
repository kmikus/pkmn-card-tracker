import { Router, Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

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
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 250;
    const skip = (page - 1) * pageSize;

    // Get sets from database with pagination
    const sets = await prisma.sets.findMany({
      skip,
      take: pageSize,
      orderBy: {
        releaseDate: 'desc' // Newest sets first
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.sets.count();

    // Transform database sets to match TCG API response structure
    const tcgSets: TCGSet[] = sets.map(set => ({
      id: set.id,
      name: set.name,
      series: set.series,
      printedTotal: set.printedTotal,
      total: set.total,
      ptcgoCode: set.ptcgoCode || undefined,
      releaseDate: set.releaseDate,
      updatedAt: set.updatedAt,
      images: {
        symbol: set.symbol,
        logo: set.logo
      }
    }));

    // Return the exact same structure as TCG API
    const response: TCGResponse<TCGSet> = {
      data: tcgSets,
      page,
      pageSize,
      count: tcgSets.length,
      totalCount
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching sets from database:', error.message);
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

    // Get set from database
    const set = await prisma.sets.findUnique({
      where: { id: setId }
    });

    if (!set) {
      res.status(404).json({ error: 'Set not found' });
      return;
    }

    // Transform database set to match TCG API response structure
    const tcgSet: TCGSet = {
      id: set.id,
      name: set.name,
      series: set.series,
      printedTotal: set.printedTotal,
      total: set.total,
      ptcgoCode: set.ptcgoCode || undefined,
      releaseDate: set.releaseDate,
      updatedAt: set.updatedAt,
      images: {
        symbol: set.symbol,
        logo: set.logo
      }
    };

    // Return the exact same structure as TCG API
    res.json(tcgSet);
  } catch (error: any) {
    console.error('Error fetching set by ID from database:', error.message);
    res.status(500).json({ error: 'Failed to fetch set' });
  }
});

export default router; 