import React, { useEffect, useState } from 'react';
import { useSetsCache } from '../hooks/useSetsCache';
import { CardSet } from '../types';

function SetsPage({ onSelectSet }: { onSelectSet: (set: CardSet) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter sets based on search term
  const filteredSets = setsList.filter(set => {
    const searchLower = searchTerm.toLowerCase();
    return set.name.toLowerCase().includes(searchLower) ||
           set.series.toLowerCase().includes(searchLower) ||
           (set.ptcgoCode && set.ptcgoCode.toLowerCase().includes(searchLower));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Card Sets
        </h1>
        
        <div className="flex justify-center mb-8">
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
          {filteredSets.map(set => (
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
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatReleaseDate(set.releaseDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {searchTerm && filteredSets.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No sets found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}

export default SetsPage; 