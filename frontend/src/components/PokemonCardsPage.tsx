import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pokemon, Card } from '../types';
import CardActionButtons from './CardActionButtons';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

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

function PokemonCardsPage({ pokemon, onBack, onAdd, onRemove, collection }: {
  pokemon: Pokemon;
  onBack: () => void;
  onAdd: (card: Card) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
  collection: Card[];
}) {
  const [tagProcessing, setTagProcessing] = useState(new Set<string>());
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCards, setProcessingCards] = useState(new Set<string>());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!pokemon) return;
    setLoading(true);
    
    // Use the base name for searching cards to get all forms, fallback to regular name
    const searchName = pokemon.baseName || pokemon.name;
    
    axios.get(`${BACKEND_URL}/api/cards/search`, {
      params: { name: searchName }
    })
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

  // Filter cards by set name
  const filteredCards = cards.filter(card => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return card.set.name.toLowerCase().includes(searchLower);
  });

  const handleCardAction = async (card: Card, isAdd: boolean) => {
    const cardId = card.id;
    setProcessingCards(prev => new Set(prev).add(cardId));
    
    try {
      if (isAdd) {
        await onAdd(card);
      } else {
        await onRemove(cardId);
      }
    } finally {
      setProcessingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    setTagProcessing(prev => new Set(prev).add(`favorite-${cardId}`));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/tags/favorite/${cardId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the card's favorite status in the collection
      const updatedCollection = collection.map(card => 
        card.id === cardId 
          ? { ...card, favorited: response.data.favorited }
          : card
      );
      
      // Update the cards list as well
      setCards(prevCards => prevCards.map(card => 
        card.id === cardId 
          ? { ...card, favorited: response.data.favorited }
          : card
      ));

    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTagProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(`favorite-${cardId}`);
        return newSet;
      });
    }
  };

  const handleToggleWishlist = async (cardId: string) => {
    setTagProcessing(prev => new Set(prev).add(`wishlist-${cardId}`));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/tags/wishlist/${cardId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the card's wishlist status in the collection
      const updatedCollection = collection.map(card => 
        card.id === cardId 
          ? { ...card, wishlisted: response.data.wishlisted }
          : card
      );
      
      // Update the cards list as well
      setCards(prevCards => prevCards.map(card => 
        card.id === cardId 
          ? { ...card, wishlisted: response.data.wishlisted }
          : card
      ));

    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setTagProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(`wishlist-${cardId}`);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-4 pb-2 px-4 border-b border-gray-200/50 dark:border-gray-700/50">
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center max-w-md dark:bg-none dark:text-white dark:[text-shadow:_0_0_8px_rgba(99,102,241,0.5),_0_0_16px_rgba(147,51,234,0.3),_0_0_24px_rgba(99,102,241,0.2)]">
              {pokemon.displayName}
            </h2>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
        
        {/* Search Box */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by set name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200 w-full placeholder-gray-500 dark:placeholder-gray-400"
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
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}
        
        {searchTerm && filteredCards.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No cards found in set "{searchTerm}"
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredCards.map(card => {
            const isInCollection = !!collection.find(c => c.id === card.id);
            const isProcessing = processingCards.has(card.id);
            
            return (
              <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full min-h-[280px]">
                <img 
                  src={card.images.small} 
                  alt={card.name} 
                  className="w-full h-auto flex-shrink-0"
                />
                <div className="p-3 flex flex-col flex-grow min-h-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 flex-shrink-0 line-clamp-2">
                    {card.set.name}
                  </div>
                  <div className="mt-auto flex-shrink-0">
                    <CardActionButtons
                      card={card}
                      isInCollection={isInCollection}
                      isProcessing={isProcessing}
                      showFavorite={false}
                      showWishlist={true}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleWishlist={handleToggleWishlist}
                    />
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