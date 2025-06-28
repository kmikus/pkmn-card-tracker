import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PokemonCardsPage from './components/PokemonCardsPage';
import CollectionPage from './components/CollectionPage';
import AuthBar from './components/AuthBar';
import useAuth from './hooks/useAuth';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [collection, setCollection] = useState([]);
  const [error, setError] = useState(null);
  const { user, loading: authLoading, fetchUser, api } = useAuth();
  const navigate = useNavigate();

  // Fetch collection from backend
  const fetchCollection = useCallback(() => {
    if (!user) {
      setCollection([]);
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
    if (!user) return;
    api.post('/collection', card)
      .then(() => setCollection(prev => [...prev, card]))
      .catch(() => setError('Failed to add card to collection'));
  };

  const removeFromCollection = (cardId) => {
    if (!user) return;
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
              collection={collection}
            />
          ) : (
            <HomePage onSelectPokemon={setSelectedPokemon} />
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
