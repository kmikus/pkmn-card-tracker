import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PokemonCardsPage from './components/PokemonCardsPage';
import CollectionPage from './components/CollectionPage';
import AuthBar from './components/AuthBar';
import useAuth from './hooks/useAuth';
import { saveCollection, loadCollection, addCardToCollection, removeCardFromCollection } from './utils/storage';
import './index.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [collection, setCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading, fetchUser, api } = useAuth();
  const navigate = useNavigate();

  // Fetch collection from backend or localStorage
  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadCollection();
      setCollection(data);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const addToCollection = async (card) => {
    try {
      const success = await addCardToCollection(card);
      if (success) {
        setCollection(prev => {
          const exists = prev.find(c => c.id === card.id);
          if (!exists) {
            return [...prev, card];
          }
          return prev;
        });
      } else {
        setError('Failed to add card to collection');
      }
    } catch (err) {
      console.error('Error adding card:', err);
      setError('Failed to add card to collection');
    }
  };

  const removeFromCollection = async (cardId) => {
    try {
      const success = await removeCardFromCollection(cardId);
      if (success) {
        setCollection(prev => prev.filter(c => c.id !== cardId));
      } else {
        setError('Failed to remove card from collection');
      }
    } catch (err) {
      console.error('Error removing card:', err);
      setError('Failed to remove card from collection');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCollection([]);
    fetchUser();
    navigate('/');
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AuthBar user={user} onLogout={handleLogout} />
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mx-4 mt-4 max-w-6xl mx-auto">
          {error}
        </div>
      )}
      
      <Routes>
        <Route path="/" element={
          selectedPokemon ? (
            <PokemonCardsPage
              pokemon={selectedPokemon}
              onBack={() => setSelectedPokemon(null)}
              onAdd={addToCollection}
              onRemove={removeFromCollection}
              collection={collection}
            />
          ) : (
            <HomePage onSelectPokemon={(p) => setSelectedPokemon(p)} />
          )
        } />
        <Route path="/collection" element={
          <CollectionPage collection={collection} onRemove={removeFromCollection} user={user} onLogout={handleLogout} />
        } />
      </Routes>
    </div>
  );
}

export default App;
