import { useEffect, useState } from 'react';
import axios from 'axios';

const TCG_API_URL = 'https://api.pokemontcg.io/v2/cards';

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

function PokemonCardsPage({ pokemon, onBack, onAdd, collection }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pokemon) return;
    setLoading(true);
    axios.get(`${TCG_API_URL}?q=name:${pokemon.name}`)
      .then(res => {
        setCards(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch cards');
        setLoading(false);
      });
  }, [pokemon]);

  useImageCache(cards.map(card => card.images?.small));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          ← Back to All Pokémon
        </button>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 capitalize">
          {pokemon.name} Cards
        </h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {cards.map(card => {
            const isInCollection = collection.find(c => c.id === card.id);
            return (
              <div key={card.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                <img 
                  src={card.images.small} 
                  alt={card.name} 
                  className="w-full h-auto"
                />
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-3">
                    {card.set.name}
                  </div>
                  <button 
                    onClick={() => onAdd(card)} 
                    disabled={isInCollection}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      isInCollection 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isInCollection ? 'In Collection' : 'Add to Collection'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PokemonCardsPage; 