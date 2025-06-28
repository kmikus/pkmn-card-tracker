import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Pokemon {
  name: string;
  id: string;
  image: string;
  types: string[];
}

const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Gen 1-8

// Type color mapping
const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-200',
  fire: 'bg-red-200',
  water: 'bg-blue-200',
  electric: 'bg-yellow-200',
  grass: 'bg-green-200',
  ice: 'bg-cyan-200',
  fighting: 'bg-red-300',
  poison: 'bg-purple-200',
  ground: 'bg-amber-200',
  flying: 'bg-indigo-200',
  psychic: 'bg-pink-200',
  bug: 'bg-lime-200',
  rock: 'bg-stone-200',
  ghost: 'bg-purple-300',
  dragon: 'bg-violet-300',
  dark: 'bg-gray-300',
  steel: 'bg-slate-200',
  fairy: 'bg-pink-100'
};

// Type gradient mapping for dual types
const typeGradients: { [key: string]: string } = {
  'fire-water': 'bg-gradient-to-br from-red-200 to-blue-200',
  'fire-grass': 'bg-gradient-to-br from-red-200 to-green-200',
  'fire-electric': 'bg-gradient-to-br from-red-200 to-yellow-200',
  'water-grass': 'bg-gradient-to-br from-blue-200 to-green-200',
  'water-electric': 'bg-gradient-to-br from-blue-200 to-yellow-200',
  'grass-electric': 'bg-gradient-to-br from-green-200 to-yellow-200',
  'fire-flying': 'bg-gradient-to-br from-red-200 to-indigo-200',
  'water-flying': 'bg-gradient-to-br from-blue-200 to-indigo-200',
  'grass-flying': 'bg-gradient-to-br from-green-200 to-indigo-200',
  'electric-flying': 'bg-gradient-to-br from-yellow-200 to-indigo-200',
  'fire-psychic': 'bg-gradient-to-br from-red-200 to-pink-200',
  'water-psychic': 'bg-gradient-to-br from-blue-200 to-pink-200',
  'grass-psychic': 'bg-gradient-to-br from-green-200 to-pink-200',
  'fire-poison': 'bg-gradient-to-br from-red-200 to-purple-200',
  'water-poison': 'bg-gradient-to-br from-blue-200 to-purple-200',
  'grass-poison': 'bg-gradient-to-br from-green-200 to-purple-200',
  'fire-ground': 'bg-gradient-to-br from-red-200 to-amber-200',
  'water-ground': 'bg-gradient-to-br from-blue-200 to-amber-200',
  'grass-ground': 'bg-gradient-to-br from-green-200 to-amber-200',
  'fire-rock': 'bg-gradient-to-br from-red-200 to-stone-200',
  'water-rock': 'bg-gradient-to-br from-blue-200 to-stone-200',
  'grass-rock': 'bg-gradient-to-br from-green-200 to-stone-200',
  'fire-bug': 'bg-gradient-to-br from-red-200 to-lime-200',
  'water-bug': 'bg-gradient-to-br from-blue-200 to-lime-200',
  'grass-bug': 'bg-gradient-to-br from-green-200 to-lime-200',
  'fire-ghost': 'bg-gradient-to-br from-red-200 to-purple-300',
  'water-ghost': 'bg-gradient-to-br from-blue-200 to-purple-300',
  'grass-ghost': 'bg-gradient-to-br from-green-200 to-purple-300',
  'fire-dragon': 'bg-gradient-to-br from-red-200 to-violet-300',
  'water-dragon': 'bg-gradient-to-br from-blue-200 to-violet-300',
  'grass-dragon': 'bg-gradient-to-br from-green-200 to-violet-300',
  'fire-dark': 'bg-gradient-to-br from-red-200 to-gray-300',
  'water-dark': 'bg-gradient-to-br from-blue-200 to-gray-300',
  'grass-dark': 'bg-gradient-to-br from-green-200 to-gray-300',
  'fire-steel': 'bg-gradient-to-br from-red-200 to-slate-200',
  'water-steel': 'bg-gradient-to-br from-blue-200 to-slate-200',
  'grass-steel': 'bg-gradient-to-br from-green-200 to-slate-200',
  'fire-fairy': 'bg-gradient-to-br from-red-200 to-pink-100',
  'water-fairy': 'bg-gradient-to-br from-blue-200 to-pink-100',
  'grass-fairy': 'bg-gradient-to-br from-green-200 to-pink-100',
  // Add more combinations as needed
};

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

  useEffect(() => {
    setLoading(true);
    axios.get(POKEAPI_URL)
      .then(res => {
        const results = res.data.results;
        // Fetch detailed data for each Pokémon to get types
        const fetchPokemonDetails = async () => {
          const pokemonWithTypes: Pokemon[] = [];
          
          for (let i = 0; i < Math.min(results.length, 50); i++) { // Limit to first 50 for performance
            try {
              const pokemonRes = await axios.get(results[i].url);
              const types = pokemonRes.data.types.map((type: any) => type.type.name);
              const id = results[i].url.split('/').filter(Boolean).pop();
              
              pokemonWithTypes.push({
                name: results[i].name,
                id,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types
              });
            } catch (err) {
              console.error(`Failed to fetch details for ${results[i].name}`);
            }
          }
          
          setPokemonList(pokemonWithTypes);
          setLoading(false);
        };
        
        fetchPokemonDetails();
      })
      .catch(() => {
        setError('Failed to fetch Pokémon list');
        setLoading(false);
      });
  }, []);

  useImageCache(pokemonList.map(p => p.image));

  const getTileBackground = (types: string[]) => {
    if (types.length === 1) {
      return typeColors[types[0]] || 'bg-gray-200';
    } else if (types.length === 2) {
      const gradientKey = `${types[0]}-${types[1]}`;
      const reverseGradientKey = `${types[1]}-${types[0]}`;
      return typeGradients[gradientKey] || typeGradients[reverseGradientKey] || 'bg-gradient-to-br from-gray-200 to-gray-300';
    }
    return 'bg-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Pokémon Card Tracker
        </h1>
        <nav className="flex justify-center mb-8">
          <Link 
            to="/collection" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Your Collection
          </Link>
        </nav>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 text-center mb-12">
          All Pokémon
        </h2>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        
        {/* Flexbox layout for Pokémon tiles */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          {pokemonList.map(p => (
            <div 
              key={p.id} 
              className={`flex flex-col items-center border-2 border-gray-300 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:border-gray-400 p-4 w-32 h-32 ${getTileBackground(p.types)}`}
              onClick={() => onSelectPokemon(p)}
            >
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-16 h-16 object-contain mb-4"
              />
              <div className="text-lg font-medium text-gray-700 capitalize text-center">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage; 