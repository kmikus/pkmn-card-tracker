import React from 'react';
import { Link } from 'react-router-dom';
import pokeballLogo from '../assets/pokeball-pokemon-catch-svgrepo-com.svg';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function AuthBar({ user, onLogout }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
              <img 
                src={pokeballLogo} 
                alt="Pokémon Card Tracker" 
                className="w-full h-full filter brightness-0 invert"
              />
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.displayName && (
                <span className="text-gray-700 font-medium">
                  Welcome, {user.displayName}
                </span>
              )}
              <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <a href={`${BACKEND_URL}/auth/google`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthBar; 