import { useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-8">
          Your Collection
        </h1>
        
        <nav className="flex justify-center mb-8">
          <Link 
            to="/" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </nav>
        
        {!user && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg text-center text-lg">
            Please log in to view your collection.
          </div>
        )}
        
        {user && Object.keys(groupedCollection).length === 0 && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg text-center text-lg">
            No cards in your collection yet. Start by browsing Pokémon and adding cards!
          </div>
        )}
        
        {user && Object.entries(groupedCollection).map(([name, cards]) => (
          <div key={name} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white capitalize">
                {name} ({cards.length} cards)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cards.map(card => (
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