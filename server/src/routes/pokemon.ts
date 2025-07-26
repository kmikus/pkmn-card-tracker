import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// PokeAPI base URL
const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// Type definitions matching PokeAPI response structure
interface PokeAPISpecies {
  name: string;
  url: string;
}

interface PokeAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPISpecies[];
}

// Get all Pokémon species
router.get('/species', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit || 1008;
    
    const response = await axios.get<PokeAPIResponse>(`${POKEAPI_URL}/pokemon-species`, {
      params: {
        limit,
        offset: req.query.offset || 0
      }
    });

    // Return the exact same structure as PokeAPI
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching Pokémon species:', error.message);
    res.status(500).json({ error: 'Failed to fetch Pokémon species' });
  }
});

// Get a specific Pokémon species by ID or name
router.get('/species/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Pokémon ID or name is required' });
    }

    const response = await axios.get(`${POKEAPI_URL}/pokemon-species/${id}`);

    // Return the exact same structure as PokeAPI
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching Pokémon species by ID:', error.message);
    res.status(500).json({ error: 'Failed to fetch Pokémon species' });
  }
});

export default router; 