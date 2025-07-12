import React, { useState, useMemo } from 'react';
import { Card } from '../types';
import { usePokemonCache } from '../hooks/usePokemonCache';

interface FilterPanelProps {
  collection: Card[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface FilterState {
  sets: string[];
  types: string[];
  rarities: string[];
  species: number[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  collection,
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { pokemonList } = usePokemonCache();

  // Create a mapping from Pokédex number to Pokémon name
  const speciesMapping = useMemo(() => {
    const mapping: Record<number, string> = {};
    pokemonList.forEach(pokemon => {
      const pokedexNumber = parseInt(pokemon.id);
      if (!isNaN(pokedexNumber)) {
        mapping[pokedexNumber] = pokemon.displayName;
      }
    });
    return mapping;
  }, [pokemonList]);

  // Extract unique filter options from collection
  const filterOptions = useMemo(() => {
    const sets = new Set<string>();
    const types = new Set<string>();
    const rarities = new Set<string>();
    const species = new Set<number>();

    collection.forEach(card => {
      if (card.set?.name) sets.add(card.set.name);
      if (card.types) card.types.forEach(type => types.add(type));
      if (card.rarity) rarities.add(card.rarity);
      if (card.nationalPokedexNumbers) {
        card.nationalPokedexNumbers.forEach(num => species.add(num));
      }
    });

    return {
      sets: Array.from(sets).sort(),
      types: Array.from(types).sort(),
      rarities: Array.from(rarities).sort(),
      species: Array.from(species).sort((a, b) => a - b)
    };
  }, [collection]);

  // Count cards for each filter option
  const filterCounts = useMemo(() => {
    const counts = {
      sets: {} as Record<string, number>,
      types: {} as Record<string, number>,
      rarities: {} as Record<string, number>,
      species: {} as Record<number, number>
    };

    collection.forEach(card => {
      if (card.set?.name) {
        counts.sets[card.set.name] = (counts.sets[card.set.name] || 0) + 1;
      }
      if (card.types) {
        card.types.forEach(type => {
          counts.types[type] = (counts.types[type] || 0) + 1;
        });
      }
      if (card.rarity) {
        counts.rarities[card.rarity] = (counts.rarities[card.rarity] || 0) + 1;
      }
      if (card.nationalPokedexNumbers) {
        card.nationalPokedexNumbers.forEach(num => {
          counts.species[num] = (counts.species[num] || 0) + 1;
        });
      }
    });

    return counts;
  }, [collection]);

  const handleFilterChange = (filterType: keyof FilterState, value: string | number, checked: boolean) => {
    const newFilters = { ...filters };
    
    if (filterType === 'sets' || filterType === 'types' || filterType === 'rarities') {
      const stringValue = value as string;
      const currentValues = newFilters[filterType] as string[];
      
      if (checked) {
        newFilters[filterType] = [...currentValues, stringValue];
      } else {
        newFilters[filterType] = currentValues.filter(v => v !== stringValue);
      }
    } else if (filterType === 'species') {
      const numberValue = value as number;
      const currentValues = newFilters[filterType] as number[];
      
      if (checked) {
        newFilters[filterType] = [...currentValues, numberValue];
      } else {
        newFilters[filterType] = currentValues.filter(v => v !== numberValue);
      }
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sets: [],
      types: [],
      rarities: [],
      species: []
    });
  };

  const getActiveFilterCount = () => {
    return filters.sets.length + filters.types.length + filters.rarities.length + filters.species.length;
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {getActiveFilterCount()}
          </span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Cards</h3>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Filter Sections */}
            <div className="space-y-4">
              {/* Sets Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleSection('sets')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Sets ({filterOptions.sets.length})</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${activeSection === 'sets' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeSection === 'sets' && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.sets.map(set => (
                      <label key={set} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.sets.includes(set)}
                            onChange={(e) => handleFilterChange('sets', set, e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{set}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {filterCounts.sets[set] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Types Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleSection('types')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Types ({filterOptions.types.length})</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${activeSection === 'types' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeSection === 'types' && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.types.map(type => (
                      <label key={type} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={(e) => handleFilterChange('types', type, e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {filterCounts.types[type] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Rarities Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleSection('rarities')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Rarities ({filterOptions.rarities.length})</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${activeSection === 'rarities' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeSection === 'rarities' && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.rarities.map(rarity => (
                      <label key={rarity} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.rarities.includes(rarity)}
                            onChange={(e) => handleFilterChange('rarities', rarity, e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{rarity}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {filterCounts.rarities[rarity] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Species Filter */}
              <div className="pb-4">
                <button
                  onClick={() => toggleSection('species')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">Species ({filterOptions.species.length})</span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${activeSection === 'species' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeSection === 'species' && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.species.map(speciesNum => {
                      const pokemonName = speciesMapping[speciesNum] || `#${speciesNum}`;
                      return (
                        <label key={speciesNum} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.species.includes(speciesNum)}
                              onChange={(e) => handleFilterChange('species', speciesNum, e.target.checked)}
                              className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {pokemonName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {filterCounts.species[speciesNum] || 0}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 