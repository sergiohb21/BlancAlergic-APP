import { useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { searchSelectors, searchActions as importedSearchActions } from '@/utils/searchSelectors';
import type { SearchState } from '@/types/search';
import { AlergiaType, AllergyCategory, AllergyIntensity } from '@/const/alergias';

// Optimized custom hooks for search state management
export const useSearchState = () => {
  const { state, dispatch } = useApp();

  const searchActions = {
    setQuery: useCallback((query: string) => {
      dispatch(importedSearchActions.setQuery(query));
    }, [dispatch]),

    setMode: useCallback((mode: 'name' | 'category' | 'advanced') => {
      dispatch(importedSearchActions.setMode(mode));
    }, [dispatch]),

    setCategoryFilter: useCallback((category: string) => {
      dispatch(importedSearchActions.setCategoryFilter(category as AllergyCategory | 'all'));
    }, [dispatch]),

    setIntensityFilter: useCallback((intensity: string) => {
      dispatch(importedSearchActions.setIntensityFilter(intensity as AllergyIntensity | 'all'));
    }, [dispatch]),

    setAlergicOnlyFilter: useCallback((isAlergicOnly: boolean) => {
      dispatch(importedSearchActions.setAlergicOnlyFilter(isAlergicOnly));
    }, [dispatch]),

    setShowSafeFoodsFilter: useCallback((showSafeFoods: boolean) => {
      dispatch(importedSearchActions.setShowSafeFoodsFilter(showSafeFoods));
    }, [dispatch]),

    clearSearch: useCallback(() => {
      dispatch(importedSearchActions.clearSearch());
    }, [dispatch]),

    resetAllSearch: useCallback(() => {
      dispatch(importedSearchActions.resetAllSearch());
    }, [dispatch]),

    applyFilters: useCallback((filters: Partial<SearchState['filters']>) => {
      dispatch(importedSearchActions.applyFilters(filters));
    }, [dispatch]),

    executeSearch: useCallback((immediate = false) => {
      dispatch(importedSearchActions.executeSearch(immediate));
    }, [dispatch]),

    setSearchActive: useCallback((isActive: boolean) => {
      dispatch(importedSearchActions.setSearchActive(isActive));
    }, [dispatch]),
  };

  return {
    searchState: state.search,
    searchActions,
    searchSelectors: {
      getQuery: () => searchSelectors.getQuery(state),
      getSearchMode: () => searchSelectors.getSearchMode(state),
      getFilters: () => searchSelectors.getFilters(state),
      getIsSearchActive: () => searchSelectors.getIsSearchActive(state),
    }
  };
};

export const useSearchResults = () => {
  const { state } = useApp();

  const searchResults = searchSelectors.getFilteredAllergies(state);
  const searchStats = searchSelectors.getSearchStats(state);
  const activeFilters = searchSelectors.getActiveFilters(state);

  return {
    results: searchResults,
    stats: searchStats,
    activeFilters,
    isLoading: state.search.results.isLoading,
    hasError: state.search.results.hasError,
    error: state.search.results.error,
    categoriesWithCount: searchSelectors.getCategoriesWithCount(state),
  };
};

// Hook for category-based search (current functionality)
export const useCategorySearch = () => {
  const { searchActions, searchState } = useSearchState();

  const selectCategory = useCallback((category: string) => {
    searchActions.setMode('category');
    searchActions.setCategoryFilter(category);
    searchActions.setQuery(category.toLowerCase());
    searchActions.setSearchActive(true);
  }, [searchActions]);

  const switchToNameSearch = useCallback(() => {
    searchActions.setMode('name');
    searchActions.setQuery('');
    searchActions.setCategoryFilter('all');
    searchActions.setSearchActive(false);
  }, [searchActions]);

  return {
    selectCategory,
    switchToNameSearch,
    currentMode: searchState.mode,
    selectedCategory: searchState.filters.category,
  };
};

// Hook for name-based search (current functionality)
export const useNameSearch = () => {
  const { searchActions, searchState } = useSearchState();

  const handleQueryChange = useCallback((query: string) => {
    searchActions.setQuery(query);
    searchActions.setMode('name');
    if (query.trim().length > 0) {
      searchActions.setSearchActive(true);
    }
  }, [searchActions]);

  const clearSearch = useCallback(() => {
    searchActions.setQuery('');
    searchActions.setMode('name');
    searchActions.setSearchActive(false);
  }, [searchActions]);

  return {
    handleQueryChange,
    clearSearch,
    query: searchState.query,
    isSearchActive: searchState.ui.isSearchActive,
  };
};

// Legacy hook for backward compatibility with existing components
export const useAllergies = () => {
  const { state, dispatch } = useApp();
  const searchResults = useSearchResults();

  // For backward compatibility, maintain the old interface
  return {
    allergies: state.allergies,
    filteredAllergies: searchResults.results.length > 0 ? searchResults.results :
      state.allergies.filter(a => a.isAlergic),
    searchQuery: state.search.query,
    setSearchQuery: (query: string) => {
      dispatch(importedSearchActions.setQuery(query));
    },
    filterAllergies: () => {
      // This would trigger the search with current filters
      dispatch(importedSearchActions.executeSearch(true));
    },
    sortBy: state.sort.field,
    sortOrder: state.sort.order,
    setSortBy: (field: keyof AlergiaType) => {
      // Dispatch sort action
      dispatch({ type: 'SORT_SET_FIELD', payload: field });
    },
    setSortOrder: (order: 'asc' | 'desc') => {
      // Dispatch sort order action
      dispatch({ type: 'SORT_SET_ORDER', payload: order });
    },
  };
};