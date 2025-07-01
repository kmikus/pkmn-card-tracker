import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

function CollectionPage({ collection, onRemove, user, onLogout }) {
  // Cache all card images
  useImageCache(collection.map(card => card.images?.small));
  // Group collection by Pokémon name
  const groupedCollection = collection.reduce((acc, card) => {
    const name = card.name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(card);
    return acc;
  }, {});

  // Dismissible guest note
  const [showGuestNote, setShowGuestNote] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header row: title left, button right */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-left">
            Your Collection
          </h1>
          <Link 
            to="/" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {/* Custom home icon from assets */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 3.1875L21.4501 10.275L21.0001 11.625H20.25V20.25H3.75005V11.625H3.00005L2.55005 10.275L12 3.1875ZM5.25005 10.125V18.75H18.75V10.125L12 5.0625L5.25005 10.125Z" fill="white"/>
            </svg>
            Back to Home
          </Link>
        </div>
        {/* Guest info message - modern alert style, full width, dismissible */}
        {!user && showGuestNote && (
          <div className="relative flex items-center bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-6 max-w-3xl mx-auto shadow">
            <span>
              Your collection is temporarily stored in your browser. Log in to save it permanently across devices.
            </span>
            <button
              onClick={() => setShowGuestNote(false)}
              className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900 text-lg font-bold px-2 focus:outline-none"
              aria-label="Dismiss"
              style={{ lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        )}
        {Object.keys(groupedCollection).length === 0 && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg text-center text-lg">
            No cards in your collection yet. Start by browsing Pokémon and adding cards!
          </div>
        )}
        {Object.entries(groupedCollection).map(([name, cards]) => (
          <div key={name} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white capitalize">
                {name} ({(cards as any[]).length} cards)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(cards as any[]).map(card => (
                  <div key={card.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <img 
                      src={card.images.small} 
                      alt={card.name} 
                      className="w-full h-auto"
                    />
                    <div className="p-3">
                      <div className="text-sm text-gray-600 mb-2">
                        {card.set.name}
                      </div>
                      <button 
                        onClick={() => onRemove(card.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Remove
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
  );
}

export default CollectionPage; 