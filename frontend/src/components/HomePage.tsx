import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Pokemon {
  name: string;
  id: string;
  image: string;
}

const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Gen 1-8

// Image cache hook
function useImageCache(urls: string[]) {
  useEffect(() => {
    if (!urls) return;
    urls.forEach(url => {
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [urls]);
}

function HomePage({ onSelectPokemon }: { onSelectPokemon: (p: Pokemon) => void }) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(POKEAPI_URL)
      .then(res => {
        const results: Pokemon[] = res.data.results.map((p: any, idx: number) => {
          const id = p.url.split('/').filter(Boolean).pop();
          return {
            name: p.name,
            id: id || '',
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        setPokemonList(results);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch Pokémon list');
        setLoading(false);
      });
  }, []);

  useImageCache(pokemonList.map(p => p.image));

  // Filter Pokémon based on search term
  const filteredPokemon = pokemonList.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Pokémon Card Tracker
        </h1>
        <nav className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Link 
            to="/collection" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-center shadow-indigo-200/50 hover:shadow-indigo-300/50 dark:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30"
          >
            Your Collection
          </Link>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200 w-full sm:w-64 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </nav>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        
        {/* Flexbox layout for Pokémon tiles */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          {filteredPokemon.map(p => (
            <div 
              key={p.id} 
              className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm cursor-pointer transition-all duration-500 ease-in-out hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 p-4 w-32 h-32 animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={() => onSelectPokemon(p)}
            >
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-16 h-16 object-contain mb-4 transition-transform duration-300"
              />
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 capitalize text-center transition-colors duration-300">
                {p.name}
              </div>
            </div>
          ))}
        </div>
        
        {searchTerm && filteredPokemon.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No Pokémon found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage; 