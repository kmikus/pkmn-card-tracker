import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PokemonCardsPage from './components/PokemonCardsPage';
import CollectionPage from './components/CollectionPage';
import AuthBar from './components/AuthBar';
import useAuth from './hooks/useAuth';
import { saveCollection, loadCollection } from './utils/storage';
import './index.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [collection, setCollection] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading, fetchUser, api } = useAuth();
  const navigate = useNavigate();

  // Fetch collection from backend or localStorage
  const fetchCollection = useCallback(() => {
    if (!user) {
      setCollection(loadCollection());
      return;
    }
    api.get('/collection')
      .then(res => setCollection(res.data))
      .catch(() => setCollection([]));
  }, [user, api]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const addToCollection = (card) => {
    if (!user) {
      setCollection(prev => {
        const updated = [...prev, card];
        saveCollection(updated);
        return updated;
      });
      return;
    }
    api.post('/collection', card)
      .then(() => setCollection(prev => [...prev, card]))
      .catch(() => setError('Failed to add card to collection'));
  };

  const removeFromCollection = (cardId) => {
    if (!user) {
      setCollection(prev => {
        const updated = prev.filter(c => c.id !== cardId);
        saveCollection(updated);
        return updated;
      });
      return;
    }
    api.delete(`/collection/${cardId}`)
      .then(() => setCollection(prev => prev.filter(c => c.id !== cardId)))
      .catch(() => setError('Failed to remove card from collection'));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCollection([]);
    fetchUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthBar user={user} onLogout={handleLogout} />
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
