import React from 'react';
import { useAllergies } from './useAllergies';

export function useSearch() {
  const { searchQuery, setSearchQuery, filterAllergies } = useAllergies();

  const debouncedSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      setTimeout(() => {
        filterAllergies();
      }, 300);
    },
    [setSearchQuery, filterAllergies]
  );

  return { searchQuery, debouncedSearch };
}