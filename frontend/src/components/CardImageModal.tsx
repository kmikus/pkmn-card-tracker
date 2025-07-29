import React from 'react';

interface CardImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  cardName: string;
}

const CardImageModal: React.FC<CardImageModalProps> = ({ isOpen, onClose, imageUrl, cardName }) => {
  if (!isOpen) return null;

  // Generate high-res image URL by replacing .png with _hires.png
  const highResImageUrl = imageUrl.replace('.png', '_hires.png');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] md:max-h-[75vh] flex items-center justify-center">
        {/* Close button - responsive positioning */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 md:fixed md:top-4 md:right-4 z-50 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Card image */}
        <img
          src={highResImageUrl}
          alt={cardName}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          style={{
            maxHeight: 'calc(100vh - 2rem)',
            maxWidth: 'calc(100vw - 2rem)'
          }}
        />
      </div>
    </div>
  );
};

export default CardImageModal; 