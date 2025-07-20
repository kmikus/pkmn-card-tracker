import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUser = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/auth/user')
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('authToken');
        setLoading(false);
      });
  }, []);

  const fetchUserWithRetry = useCallback(() => {
    // Add a small delay to allow token to be processed
    setTimeout(() => {
      fetchUser();
    }, 100);
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  // Check for token in URL (from OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchUserWithRetry();
    } else {
      fetchUser();
    }
  }, [location.search, fetchUser, fetchUserWithRetry]);

  return { user, loading, fetchUser, fetchUserWithRetry, logout, api };
}

export default useAuth; 