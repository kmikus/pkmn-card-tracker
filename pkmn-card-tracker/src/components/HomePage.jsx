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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-8">
          Pokémon Card Tracker
        </h1>
        <nav className="flex justify-center mb-8">
          <Link 
            to="/collection" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Your Collection
          </Link>
        </nav>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 text-center mb-8">
          All Pokémon
        </h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {pokemonList.map(p => (
            <div 
              key={p.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 p-4 text-center"
              onClick={() => onSelectPokemon(p)}
            >
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-16 h-16 mx-auto mb-2"
              />
              <div className="text-sm font-medium text-gray-700 capitalize">
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