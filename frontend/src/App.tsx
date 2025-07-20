import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PokemonCardsPage from './components/PokemonCardsPage';
import SetsPage from './components/SetsPage';
import SetCardsPage from './components/SetCardsPage';
import CollectionPage from './components/CollectionPage';
import AuthBar from './components/AuthBar';
import useAuth from './hooks/useAuth';
import { saveCollection, loadCollection, addCardToCollection, removeCardFromCollection } from './utils/storage';
import { Pokemon, Card, CardSet, User } from './types';
import './index.css';



function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedSet, setSelectedSet] = useState<CardSet | null>(null);
  const [collection, setCollection] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading, fetchUser, logout, api } = useAuth();
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

  const addToCollection = async (card: Card) => {
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

  const removeFromCollection = async (cardId: string) => {
    try {
      const success = await removeCardFromCollection(cardId);
      if (success) {
        setCollection(prev => prev.filter(card => card.id !== cardId));
      } else {
        setError('Failed to remove card from collection');
      }
    } catch (err) {
      console.error('Error removing card:', err);
      setError('Failed to remove card from collection');
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await api.post(`/tags/favorite/${cardId}`);
      
      // Update the card's favorite status in the collection
      setCollection(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, favorited: response.data.favorited }
          : card
      ));

    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to toggle favorite');
    }
  };

  const handleToggleWishlist = async (cardId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await api.post(`/tags/wishlist/${cardId}`);
      
      // Update the card's wishlist status in the collection
      setCollection(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, wishlisted: response.data.wishlisted }
          : card
      ));

    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setError('Failed to toggle wishlist');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API (optional, for server-side cleanup if needed)
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state and storage
      logout();
      setCollection([]); // Clear collection state
      navigate('/');
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
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
            <HomePage onSelectPokemon={(p: Pokemon) => setSelectedPokemon(p)} />
          )
        } />
        <Route path="/sets" element={
          selectedSet ? (
            <SetCardsPage
              set={selectedSet}
              onBack={() => setSelectedSet(null)}
              onAdd={addToCollection}
              onRemove={removeFromCollection}
              collection={collection}
            />
          ) : (
            <SetsPage 
              onSelectSet={(s: CardSet) => setSelectedSet(s)}
              collection={collection}
            />
          )
        } />
        <Route path="/collection" element={
          <CollectionPage 
            collection={collection} 
            onRemove={removeFromCollection} 
            onToggleFavorite={handleToggleFavorite}
            onToggleWishlist={handleToggleWishlist}
            user={user} 
            onLogout={handleLogout} 
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
