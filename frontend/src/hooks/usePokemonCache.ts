import { useState, useEffect } from 'react';
import axios from 'axios';

interface Pokemon {
  name: string;
  id: string;
  image: string;
  displayName: string;
}

const SPECIES_API_URL = 'https://pokeapi.co/api/v2/pokemon-species?limit=1008';
const CACHE_KEY = 'pokemon_species_cache_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  pokemon: Pokemon[];
  timestamp: number;
}

export function usePokemonCache() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState(new Set<string>());

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CacheData = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        if (!isExpired && data.pokemon.length > 0) {
          setPokemonList(data.pokemon);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse cached Pokémon species data');
      }
    }
    localStorage.removeItem('pokemon_cache'); // Remove old cache if present
    fetchPokemonSpecies();
  }, []);

  const fetchPokemonSpecies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(SPECIES_API_URL);
      const results = response.data.results.map((p: any) => {
        // Extract the species number from the URL
        const match = p.url.match(/\/pokemon-species\/(\d+)\//);
        const id = match ? match[1] : '';
        return {
          name: p.name,
          id,
          image: id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : '',
          displayName: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' '),
        };
      });
      setPokemonList(results);
      const cacheData: CacheData = {
        pokemon: results,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      setError('Failed to fetch Pokémon species list');
    } finally {
      setLoading(false);
    }
  };

  const preloadImages = (startIndex: number, count: number) => {
    const imagesToLoad = pokemonList.slice(startIndex, startIndex + count);
    imagesToLoad.forEach(pokemon => {
      if (!loadedImages.has(pokemon.image)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(pokemon.image));
        };
        img.src = pokemon.image;
      }
    });
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('pokemon_cache');
    setLoadedImages(new Set());
    fetchPokemonSpecies();
  };

  return {
    pokemonList,
    loading,
    error,
    loadedImages,
    preloadImages,
    clearCache,
    refreshData: fetchPokemonSpecies
  };
} 