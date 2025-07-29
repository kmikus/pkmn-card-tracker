import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CollectionPageProps, Card, Pokemon } from '../types';
import FilterPanel, { FilterState } from './FilterPanel';
import CardActionButtons from './CardActionButtons';

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

function CollectionPage({ collection, onRemove, onToggleFavorite, onToggleWishlist, user, onLogout }: CollectionPageProps) {
  const [removingCards, setRemovingCards] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sets: [],
    types: [],
    rarities: [],
    species: []
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  // Fetch Pokémon species data for filtering
  useEffect(() => {
    const fetchPokemonSpecies = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/pokemon/species?limit=1008`);
        const results = response.data.results.map((p: any) => {
          // Extract the species number from the URL
          const match = p.url.match(/\/pokemon-species\/(\d+)\//);
          const id = match ? match[1] : '';
          return {
            name: p.name,
            id,
            image: id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : '',
            displayName: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' '),
          };
        });
        setPokemonList(results);
      } catch (err) {
        console.error('Failed to fetch Pokémon species list for filtering');
      }
    };

    fetchPokemonSpecies();
  }, []);
  
  // Cache all card images
  useImageCache(collection.map(card => card.images?.small));
  
  // Filter collection based on search term and filters
  const filteredCollection = collection.filter(card => {
    // Search filter
    const matchesSearch = !searchTerm || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.set.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Set filter
    if (filters.sets.length > 0 && !filters.sets.includes(card.set.name)) {
      return false;
    }
    
    // Type filter
    if (filters.types.length > 0 && (!card.types || !card.types.some(type => filters.types.includes(type)))) {
      return false;
    }
    
    // Rarity filter
    if (filters.rarities.length > 0 && (!card.rarity || !filters.rarities.includes(card.rarity))) {
      return false;
    }
    
    // Species filter
    if (filters.species.length > 0 && (!card.nationalPokedexNumbers || !card.nationalPokedexNumbers.some(num => filters.species.includes(num)))) {
      return false;
    }
    
    return true;
  });

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

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-panel')) {
        setIsFilterPanelOpen(false);
      }
    };

    if (isFilterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPanelOpen]);

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

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search cards by name or set..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="filter-panel">
              <FilterPanel
                collection={collection}
                pokemonList={pokemonList}
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={isFilterPanelOpen}
                onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              />
            </div>
          </div>

          {/* Collection Stats */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredCollection.length} of {collection.length} cards
              {searchTerm && ` matching "${searchTerm}"`}
              {(filters.sets.length > 0 || filters.types.length > 0 || filters.rarities.length > 0 || filters.species.length > 0) && 
                ` with ${filters.sets.length + filters.types.length + filters.rarities.length + filters.species.length} active filters`
              }
            </p>
          </div>

          {/* Empty State */}
          {filteredCollection.length === 0 && (
            <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg text-center text-lg">
              {searchTerm || filters.sets.length > 0 || filters.types.length > 0 || filters.rarities.length > 0 || filters.species.length > 0
                ? 'No cards found matching your search and filter criteria. Try adjusting your filters.'
                : 'No cards in your collection yet. Start by browsing Pokémon and adding cards!'
              }
            </div>
          )}

          {/* Cards Grid */}
          {filteredCollection.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {filteredCollection.map(card => (
                <div key={card.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] xl:w-[calc(16.666%-0.833rem)] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <img 
                    src={card.images.small} 
                    alt={card.name} 
                    className="w-full h-auto"
                  />
                  <div className="p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {card.set.name}
                    </div>
                    <CardActionButtons
                      card={card}
                      isInCollection={true}
                      isProcessing={removingCards.has(card.id)}
                      showFavorite={true}
                      showWishlist={false}
                      onAdd={() => Promise.resolve()}
                      onRemove={handleRemoveCard}
                      onToggleFavorite={onToggleFavorite}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionPage; 