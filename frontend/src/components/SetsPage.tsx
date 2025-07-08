import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSetsCache } from '../hooks/useSetsCache';
import { CardSet, Card } from '../types';

function SetsPage({ onSelectSet, collection }: { 
  onSelectSet: (set: CardSet) => void;
  collection: Card[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { setsList, loading, error, loadedImages, preloadImages } = useSetsCache();
  const [localLoadedImages, setLocalLoadedImages] = useState(new Set<string>());

  // Preload first 50 images on mount
  useEffect(() => {
    if (setsList.length > 0) {
      preloadImages(0, 50);
    }
  }, [setsList.length, preloadImages]);

  // Handle individual image load
  const handleImageLoad = (imageUrl: string) => {
    setLocalLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  // Filter and sort sets
  const filteredAndSortedSets = setsList
    .filter(set => {
      const searchLower = searchTerm.toLowerCase();
      return set.name.toLowerCase().includes(searchLower) ||
             set.series.toLowerCase().includes(searchLower) ||
             (set.ptcgoCode && set.ptcgoCode.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Format release date
  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate card count for a specific set
  const getCardCountForSet = (setId: string) => {
    return collection.filter(card => {
      return card.set && card.set.id === setId;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-4 pb-2 px-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto">
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
              Card Sets
            </h1>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search sets..."
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
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {sortOrder === 'newest' ? (
                // Down arrow for newest first
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              ) : (
                // Up arrow for oldest first
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              )}
            </svg>
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
        
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
        
        {/* Grid layout for set tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAndSortedSets.map(set => (
            <div 
              key={set.id} 
              className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm cursor-pointer transition-all duration-500 ease-in-out hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 p-6 animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={() => onSelectSet(set)}
            >
              <div className="flex flex-col items-center text-center">
                <img 
                  src={set.images.logo} 
                  alt={set.name} 
                  className={`w-24 h-24 object-contain mb-4 transition-all duration-300 ${
                    localLoadedImages.has(set.images.logo) ? 'opacity-100' : 'opacity-50'
                  }`}
                  onLoad={() => handleImageLoad(set.images.logo)}
                  onError={() => handleImageLoad(set.images.logo)}
                />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {set.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {set.series}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={set.images.symbol} 
                    alt={`${set.name} symbol`} 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {set.printedTotal} cards
                  </span>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {getCardCountForSet(set.id)}/{set.printedTotal} collected
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatReleaseDate(set.releaseDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {searchTerm && filteredAndSortedSets.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No sets found matching "{searchTerm}"
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default SetsPage; 