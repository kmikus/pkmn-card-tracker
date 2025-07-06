// Common types used across the application

export interface Pokemon {
  name: string;
  id: string;
  image: string;
  displayName: string;
  baseName?: string;
  isForm?: boolean;
  isRegional?: boolean;
}

export interface Card {
  id: string;
  name: string;
  images: {
    small: string;
  };
  set: {
    name: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  picture?: string;
}

export interface AuthBarProps {
  user: User | null;
  onLogout: () => void;
}

export interface CollectionPageProps {
  collection: Card[];
  onRemove: (cardId: string) => Promise<void>;
  user: User | null;
  onLogout: () => void;
}

export interface PokemonCardsPageProps {
  pokemon: Pokemon;
  onBack: () => void;
  onAdd: (card: Card) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
  collection: Card[];
} 