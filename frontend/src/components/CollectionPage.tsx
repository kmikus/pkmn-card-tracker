import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CollectionPageProps, Card } from '../types';
import { usePokemonCache } from '../hooks/usePokemonCache';

// Image cache hook
function useImageCache(urls: string[]) {
  useEffect(() => {
    if (!urls) return;
    urls.forEach((url: string) => {
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [urls]);
}

// Function to extract base Pokémon name from cards with prefixes
function getBasePokemonName(cardName: string, pokemonList: any[]): string {
  const cardNameLower = cardName.toLowerCase();
  let bestMatch = '';
  let bestMatchLength = 0;
  for (const pokemon of pokemonList) {
    const pokemonName = pokemon.name.toLowerCase();
    const displayName = pokemon.displayName.toLowerCase();
    if (cardNameLower.includes(pokemonName) && pokemonName.length > bestMatchLength) {
      bestMatch = pokemon.name;
      bestMatchLength = pokemonName.length;
    }
    if (cardNameLower.includes(displayName) && displayName.length > bestMatchLength) {
      bestMatch = pokemon.name;
      bestMatchLength = displayName.length;
    }
  }
  if (bestMatch) {
    return bestMatch;
  }
  return cardName;
}

function CollectionPage({ collection, onRemove, user, onLogout }: CollectionPageProps) {
  const [removingCards, setRemovingCards] = useState(new Set());
  const { pokemonList } = usePokemonCache();
  
  // Cache all card images
  useImageCache(collection.map(card => card.images?.small));
  
  // Group collection by base Pokémon name
  const groupedCollection = collection.reduce((acc: Record<string, Card[]>, card: Card) => {
    const baseName = getBasePokemonName(card.name, pokemonList);
    if (!acc[baseName]) acc[baseName] = [];
    acc[baseName].push(card);
    return acc;
  }, {});

  // Dismissible guest note with localStorage persistence
  const [showGuestNote, setShowGuestNote] = useState(() => {
    if (user) return false; // Don't show for logged-in users
    return localStorage.getItem('guestNoteDismissed') !== 'true';
  });

  const dismissGuestNote = () => {
    setShowGuestNote(false);
    localStorage.setItem('guestNoteDismissed', 'true');
  };

  const handleRemoveCard = async (cardId: string) => {
    setRemovingCards(prev => new Set(prev).add(cardId));
    try {
      await onRemove(cardId);
    } finally {
      setRemovingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="sticky top-0 z-10 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 pt-4 pb-2 px-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {/* Custom home icon from assets */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 3.1875L21.4501 10.275L21.0001 11.625H20.25V20.25H3.75005V11.625H3.00005L2.55005 10.275L12 3.1875ZM5.25005 10.125V18.75H18.75V10.125L12 5.0625L5.25005 10.125Z" fill="white"/>
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:bg-none dark:text-white dark:[text-shadow:_0_0_8px_rgba(99,102,241,0.5),_0_0_16px_rgba(147,51,234,0.3),_0_0_24px_rgba(99,102,241,0.2)]">
              Your Collection
            </h1>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
        {/* Guest info message - modern alert style, full width, dismissible */}
        {!user && showGuestNote && (
          <div className="relative flex items-center bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm mb-6 max-w-3xl mx-auto shadow">
            <span>
              Your collection is temporarily stored in your browser. Log in to save it permanently across devices.
            </span>
            <button
              onClick={dismissGuestNote}
              className="absolute top-2 right-2 text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 text-lg font-bold px-2 focus:outline-none"
              aria-label="Dismiss"
              style={{ lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        )}
        {Object.keys(groupedCollection).length === 0 && (
          <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg text-center text-lg">
            No cards in your collection yet. Start by browsing Pokémon and adding cards!
          </div>
        )}
        {Object.entries(groupedCollection).map(([name, cards]) => (
          <div key={name} className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white capitalize">
                {name} ({(cards as any[]).length} cards)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {(cards as any[]).map(card => (
                  <div key={card.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <img 
                      src={card.images.small} 
                      alt={card.name} 
                      className="w-full h-auto"
                    />
                    <div className="p-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {card.set.name}
                      </div>
                      <button 
                        onClick={() => handleRemoveCard(card.id)}
                        disabled={removingCards.has(card.id)}
                        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                          removingCards.has(card.id)
                            ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {removingCards.has(card.id) ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default CollectionPage; 