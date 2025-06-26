import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Gen 1-8
const TCG_API_URL = 'https://api.pokemontcg.io/v2/cards';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Create axios instance for backend calls with credentials
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

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

function Home({ onSelectPokemon }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(POKEAPI_URL)
      .then(res => {
        const results = res.data.results.map((p, idx) => {
          const id = p.url.split('/').filter(Boolean).pop();
          return {
            name: p.name,
            id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        setPokemonList(results);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Pokémon list');
        setLoading(false);
      });
  }, []);

  useImageCache(pokemonList.map(p => p.image));

  return (
    <div>
      <h1>Pokémon Card Tracker</h1>
      <nav style={{marginBottom:'1rem'}}>
        <Link to="/collection">Your Collection</Link>
      </nav>
      <h2>All Pokémon</h2>
      {loading && <p>Loading Pokémon...</p>}
      {error && <p>{error}</p>}
      <div className="card-list">
        {pokemonList.map(p => (
          <div key={p.id} className="card-item" onClick={() => onSelectPokemon(p)} style={{cursor:'pointer'}}>
            <img src={p.image} alt={p.name} />
            <div style={{textTransform:'capitalize'}}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PokemonCards({ pokemon, onBack, onAdd, collection }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pokemon) return;
    setLoading(true);
    axios.get(`${TCG_API_URL}?q=name:${pokemon.name}`)
      .then(res => {
        setCards(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch cards');
        setLoading(false);
      });
  }, [pokemon]);

  useImageCache(cards.map(card => card.images?.small));

  return (
    <div>
      <button onClick={onBack} style={{marginBottom:'1rem'}}>← Back to All Pokémon</button>
      <h2 style={{textTransform:'capitalize'}}>{pokemon.name} Cards</h2>
      {loading && <p>Loading cards...</p>}
      {error && <p>{error}</p>}
      <div className="card-list">
        {cards.map(card => (
          <div key={card.id} className="card-item">
            <img src={card.images.small} alt={card.name} />
            <div>{card.set.name}</div>
            <button onClick={() => onAdd(card)} disabled={!!collection.find(c => c.id === card.id)}>
              {collection.find(c => c.id === card.id) ? 'In Collection' : 'Add to Collection'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    setLoading(true);
    api.get('/auth/user')
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const fetchUserWithRetry = useCallback(() => {
    // Add a small delay to allow session cookie to be set after OAuth redirect
    setTimeout(() => {
      fetchUser();
    }, 100);
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, fetchUser, fetchUserWithRetry };
}

function AuthBar({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      {user ? (
        <>
          {user.displayName && <span>Welcome, {user.displayName}</span>}
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <a href={`${BACKEND_URL}/auth/google`}>
          <button>Login with Google</button>
        </a>
      )}
    </div>
  );
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
    <div>
      <AuthBar user={user} onLogout={onLogout} />
      <h1>Your Collection</h1>
      <nav style={{marginBottom:'1rem'}}>
        <Link to="/">Home</Link>
      </nav>
      {!user && <p>Please log in to view your collection.</p>}
      {user && Object.keys(groupedCollection).length === 0 && <p>No cards in your collection yet.</p>}
      {user && Object.entries(groupedCollection).map(([name, cards]) => (
        <div key={name} className="pokemon-group">
          <h3>{name}</h3>
          <div className="card-list">
            {cards.map(card => (
              <div key={card.id} className="card-item">
                <img src={card.images.small} alt={card.name} />
                <div>{card.set.name}</div>
                <button onClick={() => onRemove(card.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [collection, setCollection] = useState([]);
  const [error, setError] = useState(null);
  const { user, loading: authLoading, fetchUser, fetchUserWithRetry } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user just completed OAuth (redirected from backend)
  useEffect(() => {
    // If we're on the root path and there's no user yet, but we have a session cookie,
    // try to fetch the user (this handles OAuth redirects)
    if (location.pathname === '/' && !user && !authLoading) {
      fetchUserWithRetry();
    }
  }, [location.pathname, user, authLoading, fetchUserWithRetry]);

  // Fetch collection from backend
  const fetchCollection = useCallback(() => {
    if (!user) {
      setCollection([]);
      return;
    }
    api.get('/collection')
      .then(res => setCollection(res.data))
      .catch(() => setCollection([]));
  }, [user]);

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
    api.get('/auth/logout')
      .then(() => {
        setCollection([]);
        fetchUser();
        navigate('/');
      });
  };

  return (
    <>
      <AuthBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          selectedPokemon ? (
            <PokemonCards
              pokemon={selectedPokemon}
              onBack={() => setSelectedPokemon(null)}
              onAdd={addToCollection}
              collection={collection}
            />
          ) : (
            <Home onSelectPokemon={setSelectedPokemon} />
          )
        } />
        <Route path="/collection" element={
          <CollectionPage collection={collection} onRemove={removeFromCollection} user={user} onLogout={handleLogout} />
        } />
      </Routes>
    </>
  );
}

export default App;
