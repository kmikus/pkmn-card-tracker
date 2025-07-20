import React, { useState } from 'react';
import { Card } from '../types';

interface CardActionButtonsProps {
  card: Card;
  isInCollection: boolean;
  isProcessing: boolean;
  showFavorite?: boolean;
  showWishlist?: boolean;
  onAdd: (card: Card) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
  onToggleFavorite: (cardId: string) => Promise<void>;
  onToggleWishlist: (cardId: string) => Promise<void>;
}

const CardActionButtons: React.FC<CardActionButtonsProps> = ({
  card,
  isInCollection,
  isProcessing,
  showFavorite = false,
  showWishlist = false,
  onAdd,
  onRemove,
  onToggleFavorite,
  onToggleWishlist
}) => {
  const [isFavoriteProcessing, setIsFavoriteProcessing] = useState(false);
  const [isWishlistProcessing, setIsWishlistProcessing] = useState(false);

  const handleCardAction = async (isAdd: boolean) => {
    if (isAdd) {
      await onAdd(card);
    } else {
      await onRemove(card.id);
    }
  };

  const handleFavoriteToggle = async () => {
    setIsFavoriteProcessing(true);
    try {
      await onToggleFavorite(card.id);
    } finally {
      setIsFavoriteProcessing(false);
    }
  };

  const handleWishlistToggle = async () => {
    setIsWishlistProcessing(true);
    try {
      await onToggleWishlist(card.id);
    } finally {
      setIsWishlistProcessing(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2 w-full">
      {/* Favorite Button - Only show on collection page */}
      {showFavorite && (
        <button
          onClick={handleFavoriteToggle}
          disabled={isFavoriteProcessing}
          className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
            isFavoriteProcessing
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              : card.favorited
                ? 'text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          style={{
            backgroundColor: card.favorited ? '#FFD700' : undefined,
            borderColor: card.favorited ? '#FFD700' : undefined
          }}
          title={card.favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavoriteProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={card.favorited ? 'currentColor' : 'none'} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      )}

      {/* Wishlist Button - Only show on sets/pokemon pages */}
      {showWishlist && (
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlistProcessing}
          className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
            isWishlistProcessing
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              : card.wishlisted
                ? 'text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          style={{
            backgroundColor: card.wishlisted ? '#FF69B4' : undefined,
            borderColor: card.wishlisted ? '#FF69B4' : undefined
          }}
          title={card.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlistProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={card.wishlisted ? 'currentColor' : 'none'} stroke="currentColor">
              {/* Bookmark icon - rectangle with triangular notch at bottom */}
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          )}
        </button>
      )}

      {/* Add/Remove Button */}
      <button
        onClick={() => handleCardAction(!isInCollection)}
        disabled={isProcessing}
        className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
          isProcessing
            ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
            : isInCollection
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            {isInCollection ? (
              // Minus circle icon
              <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM8 12C8 11.4477 8.44772 11 9 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H9C8.44772 13 8 12.5523 8 12Z" />
            ) : (
              // Plus circle icon
              <path fillRule="evenodd" clipRule="evenodd" d="M13 9C13 8.44772 12.5523 8 12 8C11.4477 8 11 8.44772 11 9V11H9C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13H11V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V13H15C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11H13V9ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" />
            )}
          </svg>
        )}
        {isProcessing ? 'Processing...' : (isInCollection ? 'Remove' : 'Add')}
      </button>
    </div>
  );
};

export default CardActionButtons; 