import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardSet } from '../types';
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

function SetCardsPage({ set, onBack, onAdd, onRemove, collection }: {
  set: CardSet;
  onBack: () => void;
  onAdd: (card: Card) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
  collection: Card[];
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCards, setProcessingCards] = useState(new Set<string>());
  const [tagProcessing, setTagProcessing] = useState(new Set<string>());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!set) return;
    setLoading(true);
    
    // Fetch cards from the selected set
    axios.get(`${BACKEND_URL}/api/cards/set/${set.id}`)
      .then(res => {
        setCards(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch cards');
        setLoading(false);
      });
  }, [set]);

  useImageCache(cards.map(card => card.images?.small));

  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    !searchTerm || 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {/* Back arrow icon */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <img 
                src={set.images.logo} 
                alt={set.name} 
                className="w-12 h-12 object-contain"
              />
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                  {set.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {set.series} • {set.printedTotal} cards
                </p>
              </div>
            </div>
            <div className="w-12"></div> {/* Spacer for centering */}
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
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        {!loading && !error && (
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search cards by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchTerm && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredCards.length} of {cards.length} cards matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Cards Grid */}
        {!loading && !error && (
          <>
            {filteredCards.length === 0 && searchTerm ? (
              <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg text-center text-lg">
                No cards found matching "{searchTerm}". Try a different search term.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {filteredCards.map(card => {
                  const isInCollection = !!collection.find(c => c.id === card.id);
                  const isProcessing = processingCards.has(card.id);
                  
                  return (
                    <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full">
                      <img 
                        src={card.images.small} 
                        alt={card.name} 
                        className="w-full h-auto"
                      />
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-shrink-0">
                          {card.name}
                        </div>
                        <div className="mt-auto">
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
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}

export default SetCardsPage; 