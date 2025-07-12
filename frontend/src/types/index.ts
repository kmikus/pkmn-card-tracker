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
    id: string;
    name: string;
  };
  // Additional properties for filtering
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  rarity?: string;
  nationalPokedexNumbers?: number[];
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
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

export interface SetsPageProps {
  onSelectSet: (set: CardSet) => void;
}

export interface SetCardsPageProps {
  set: CardSet;
  onBack: () => void;
  onAdd: (card: Card) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
  collection: Card[];
} 