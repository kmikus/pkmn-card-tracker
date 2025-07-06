import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Create axios instance for backend calls with JWT token
const api = axios.create({
  baseURL: BACKEND_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check if user is authenticated
function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}

// Guest user storage (localStorage)
const GUEST_COLLECTION_KEY = 'guestCardCollection';

function saveGuestCollection(collection: any[]): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(GUEST_COLLECTION_KEY, JSON.stringify(collection));
      return true;
    } catch (error) {
      console.error('Error saving guest collection:', error);
      return false;
    }
  }
  return false;
}

function loadGuestCollection(): any[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = localStorage.getItem(GUEST_COLLECTION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading guest collection:', error);
    }
  }
  return [];
}

function addCardToGuestCollection(card: any): boolean {
  const collection = loadGuestCollection();
  const exists = collection.find(c => c.id === card.id);
  if (!exists) {
    collection.push(card);
    return saveGuestCollection(collection);
  }
  return true;
}

function removeCardFromGuestCollection(cardId: string): boolean {
  const collection = loadGuestCollection();
  const filtered = collection.filter(c => c.id !== cardId);
  return saveGuestCollection(filtered);
}

function clearGuestCollection(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(GUEST_COLLECTION_KEY);
    return true;
  }
  return false;
}

// Authenticated user storage (API)
async function saveCollection(collection: any[]): Promise<boolean> {
  if (!isAuthenticated()) {
    return saveGuestCollection(collection);
  }
  
  try {
    // For now, we'll save each card individually
    // In a production app, you might want to batch these operations
    for (const card of collection) {
      await api.post('/collection', card);
    }
    return true;
  } catch (error) {
    console.error('Error saving collection:', error);
    return false;
  }
}

async function loadCollection(): Promise<any[]> {
  if (!isAuthenticated()) {
    return loadGuestCollection();
  }
  
  try {
    const response = await api.get('/collection');
    return response.data || [];
  } catch (error) {
    console.error('Error loading collection:', error);
    return [];
  }
}

async function addCardToCollection(card: any): Promise<boolean> {
  if (!isAuthenticated()) {
    return addCardToGuestCollection(card);
  }
  
  try {
    await api.post('/collection', card);
    return true;
  } catch (error) {
    console.error('Error adding card to collection:', error);
    return false;
  }
}

async function removeCardFromCollection(cardId: string): Promise<boolean> {
  if (!isAuthenticated()) {
    return removeCardFromGuestCollection(cardId);
  }
  
  try {
    await api.delete(`/collection/${cardId}`);
    return true;
  } catch (error) {
    console.error('Error removing card from collection:', error);
    return false;
  }
}

async function clearCollection(): Promise<boolean> {
  if (!isAuthenticated()) {
    return clearGuestCollection();
  }
  
  try {
    // Load current collection and remove each card
    const collection = await loadCollection();
    for (const card of collection) {
      await api.delete(`/collection/${card.id}`);
    }
    return true;
  } catch (error) {
    console.error('Error clearing collection:', error);
    return false;
  }
}

export {
  saveCollection,
  loadCollection,
  addCardToCollection,
  removeCardFromCollection,
  clearCollection,
  isAuthenticated
}; 