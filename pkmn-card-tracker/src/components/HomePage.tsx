import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Gen 1-8

// Image cache hook
function useImageCache(urls) {
  useEffect(() => {
    if (!urls) return;
    urls.forEach(url => {
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [urls]);
}

function HomePage({ onSelectPokemon }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(POKEAPI_URL)
      .then(res => {
        const results = res.data.results.map((p, idx) => {
          const id = p.url.split('/').filter(Boolean).pop();
          return {
            name: p.name,
            id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        setPokemonList(results);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Pokémon list');
        setLoading(false);
      });
  }, []);

  useImageCache(pokemonList.map(p => p.image));

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
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
          {pokemonList.map(p => (
            <div 
              key={p.id} 
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-translate-y-2 p-3 text-center border-2 border-transparent hover:border-indigo-300"
              onClick={() => onSelectPokemon(p)}
            >
              {/* Background tile with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300"></div>
              
              {/* Pokémon sprite container */}
              <div className="relative z-10 bg-white rounded-xl p-2 mb-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-12 h-12 md:w-14 md:h-14 mx-auto group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              {/* Pokémon name */}
              <div className="relative z-10 text-xs md:text-sm font-medium text-gray-700 capitalize group-hover:text-indigo-700 transition-colors duration-300">
                {p.name}
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400/0 to-purple-400/0 group-hover:from-indigo-400/10 group-hover:to-purple-400/10 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage; 