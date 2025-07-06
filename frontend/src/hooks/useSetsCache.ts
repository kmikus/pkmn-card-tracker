import { useState, useEffect } from 'react';
import axios from 'axios';
import { CardSet } from '../types';

const SETS_API_URL = 'https://api.pokemontcg.io/v2/sets';
const CACHE_KEY = 'pokemon_sets_cache_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  sets: CardSet[];
  timestamp: number;
}

export function useSetsCache() {
  const [setsList, setSetsList] = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState(new Set<string>());

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CacheData = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        if (!isExpired && data.sets.length > 0) {
          setSetsList(data.sets);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse cached sets data');
      }
    }
    fetchSets();
  }, []);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(SETS_API_URL);
      const sets = response.data.data;
      setSetsList(sets);
      const cacheData: CacheData = {
        sets,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      setError('Failed to fetch card sets list');
    } finally {
      setLoading(false);
    }
  };

  const preloadImages = (startIndex: number, count: number) => {
    const imagesToLoad = setsList.slice(startIndex, startIndex + count);
    imagesToLoad.forEach(set => {
      if (!loadedImages.has(set.images.logo)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(set.images.logo));
        };
        img.src = set.images.logo;
      }
    });
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setLoadedImages(new Set());
    fetchSets();
  };

  return {
    setsList,
    loading,
    error,
    loadedImages,
    preloadImages,
    clearCache,
    refreshData: fetchSets
  };
} 