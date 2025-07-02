import { useEffect, useState } from 'react';
import axios from 'axios';
import plusIcon from '../assets/plus-circle-svgrepo-com.svg';
import minusIcon from '../assets/minus-circle-svgrepo-com.svg';

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

function PokemonCardsPage({ pokemon, onBack, onAdd, onRemove, collection }) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100 pt-4 pb-2 px-4 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {/* Custom home icon from assets */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 3.1875L21.4501 10.275L21.0001 11.625H20.25V20.25H3.75005V11.625H3.00005L2.55005 10.275L12 3.1875ZM5.25005 10.125V18.75H18.75V10.125L12 5.0625L5.25005 10.125Z" fill="white"/>
              </svg>
            </button>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
              {pokemon.name}
            </h2>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
        
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {cards.map(card => {
            const isInCollection = collection.find(c => c.id === card.id);
            return (
              <div key={card.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full">
                <img 
                  src={card.images.small} 
                  alt={card.name} 
                  className="w-full h-auto"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="text-sm text-gray-600 mb-3 flex-shrink-0">
                    {card.set.name}
                  </div>
                  <div className="mt-auto">
                    <button 
                      onClick={() => isInCollection ? onRemove(card.id) : onAdd(card)} 
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isInCollection 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                    <svg 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      {isInCollection ? (
                        // Minus circle icon
                        <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM8 12C8 11.4477 8.44772 11 9 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H9C8.44772 13 8 12.5523 8 12Z" />
                      ) : (
                        // Plus circle icon
                        <path fillRule="evenodd" clipRule="evenodd" d="M13 9C13 8.44772 12.5523 8 12 8C11.4477 8 11 8.44772 11 9V11H9C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13H11V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V13H15C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11H13V9ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" />
                      )}
                    </svg>
                    {isInCollection ? 'Remove' : 'Add'}
                  </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default PokemonCardsPage; 