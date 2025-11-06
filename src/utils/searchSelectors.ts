import { createSelector } from 'reselect';
import type { AppState, SearchState } from '@/types/search';
import { AlergiaType, AllergyCategory, AllergyIntensity } from '@/const/alergias';

// Memoized selectors for optimal performance
export const searchSelectors = {
  // Basic selectors
  getQuery: (state: AppState) => state.search.query,
  getSearchMode: (state: AppState) => state.search.mode,
  getFilters: (state: AppState) => state.search.filters,
  getResults: (state: AppState) => state.search.results,
  getSearchState: (state: AppState) => state.search,

  // Computed selectors
  getSearchResults: createSelector(
    [(state: AppState) => state.search.results.items],
    (items) => items
  ),

  getFilteredAllergies: createSelector(
    [
      (state: AppState) => state.allergies,
      (state: AppState) => state.search.query,
      (state: AppState) => state.search.mode,
      (state: AppState) => state.search.filters,
      (state: AppState) => state.sort
    ],
    (allergies, query, mode, filters, sort) => {
      let filtered = [...allergies];

      // Apply search logic based on mode
      if (mode === 'name' && query.trim().length >= 4) {
        filtered = filtered.filter(allergy =>
          allergy.name.toLowerCase().includes(query.toLowerCase()) &&
          allergy.isAlergic // Only show allergic items for name search
        );
      } else if (mode === 'category' && filters.category !== 'all') {
        filtered = filtered.filter(allergy =>
          allergy.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply additional filters
      if (filters.isAlergicOnly) {
        filtered = filtered.filter(allergy => allergy.isAlergic);
      }

      if (filters.intensity !== 'all') {
        filtered = filtered.filter(allergy =>
          allergy.intensity.toLowerCase() === filters.intensity.toLowerCase()
        );
      }

      // Apply sorting
      return filtered.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sort.order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
  ),

  // UI state selectors
  getIsSearchActive: (state: AppState) => state.search.ui.isSearchActive,
  getSearchStats: createSelector(
    [
      (state: AppState) => state.search.results.items,
      (state: AppState) => state.allergies,
      (state: AppState) => state.search.mode,
      (state: AppState) => state.search.query
    ],
    (results, allAllergies, mode, query) => ({
      resultCount: results.length,
      totalCount: allAllergies.length,
      allergenicCount: results.filter(r => r.isAlergic).length,
      safeCount: results.filter(r => !r.isAlergic).length,
      hasQuery: query.trim().length > 0,
      isNameSearch: mode === 'name',
      isCategorySearch: mode === 'category',
    })
  ),

  // Performance selectors
  getSearchPerformance: createSelector(
    [
      (state: AppState) => state.search.metadata.lastSearchTime,
      (state: AppState) => state.search.metadata.searchCount,
      (state: AppState) => state.search.results.isLoading,
    ],
    (lastSearchTime, searchCount, isLoading) => ({
      lastSearchTime,
      searchCount,
      isLoading,
      averageSearchTime: searchCount > 0 ? Date.now() - lastSearchTime : 0,
    })
  ),

  // Filter state selectors
  getActiveFilters: createSelector(
    [(state: AppState) => state.search.filters],
    (filters) => {
      const activeFilters: string[] = [];

      if (filters.category !== 'all') {
        activeFilters.push(`Categoría: ${filters.category}`);
      }
      if (filters.intensity !== 'all') {
        activeFilters.push(`Intensidad: ${filters.intensity}`);
      }
      if (filters.isAlergicOnly) {
        activeFilters.push('Solo alérgicos');
      }
      if (!filters.showSafeFoods) {
        activeFilters.push('Ocultar seguros');
      }

      return activeFilters;
    }
  ),

  // Category-specific selectors
  getCategoriesWithCount: createSelector(
    [
      (state: AppState) => state.allergies,
    ],
    (allergies) => {
      const categoryCount = allergies.reduce((acc, allergy) => {
        acc[allergy.category] = (acc[allergy.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
        allergenicCount: allergies.filter(a => a.category === category && a.isAlergic).length,
        safeCount: allergies.filter(a => a.category === category && !a.isAlergic).length,
      }));
    }
  ),

  // Advanced search selectors (future features)
  getRecentSearches: createSelector(
    [(state: AppState) => state.search.metadata.recentSearches],
    (recentSearches) => recentSearches.slice(0, 5), // Limit to 5 most recent
  ),

  getSearchSuggestions: createSelector(
    [
      (state: AppState) => state.search.metadata.suggestions,
      (state: AppState) => state.search.query,
    ],
    (suggestions, query) => {
      if (!query.trim()) return [];
      return suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
    }
  ),
};

// Action creators for search operations
export const searchActions = {
  // Core search actions
  setQuery: (query: string) => ({ type: 'SEARCH_SET_QUERY' as const, payload: query }),
  setMode: (mode: 'name' | 'category' | 'advanced') => ({ type: 'SEARCH_SET_MODE' as const, payload: mode }),

  // Filter actions
  setCategoryFilter: (category: AllergyCategory | 'all') => ({
    type: 'SEARCH_SET_CATEGORY_FILTER' as const,
    payload: category
  }),
  setIntensityFilter: (intensity: AllergyIntensity | 'all') => ({
    type: 'SEARCH_SET_INTENSITY_FILTER' as const,
    payload: intensity
  }),
  setAlergicOnlyFilter: (isAlergicOnly: boolean) => ({
    type: 'SEARCH_SET_ALLERGIC_ONLY_FILTER' as const,
    payload: isAlergicOnly
  }),
  setShowSafeFoodsFilter: (showSafeFoods: boolean) => ({
    type: 'SEARCH_SET_SHOW_SAFE_FOODS_FILTER' as const,
    payload: showSafeFoods
  }),

  // Result actions
  startSearch: (query?: string) => ({ type: 'SEARCH_START' as const, payload: { query: query || '' } }),
  searchSuccess: (results: AlergiaType[], totalCount: number) => ({
    type: 'SEARCH_SUCCESS' as const,
    payload: { results, totalCount }
  }),
  searchError: (error: string) => ({ type: 'SEARCH_ERROR' as const, payload: { error } }),
  clearSearch: () => ({ type: 'SEARCH_CLEAR' as const }),

  // UI actions
  setSearchActive: (isActive: boolean) => ({ type: 'SEARCH_SET_UI_ACTIVE' as const, payload: isActive }),
  setHighlightedIndex: (index: number) => ({ type: 'SEARCH_SET_HIGHLIGHTED_INDEX' as const, payload: index }),

  // Batch actions
  resetAllSearch: () => ({ type: 'SEARCH_RESET_ALL' as const }),
  applyFilters: (filters: Partial<SearchState['filters']>) => ({
    type: 'SEARCH_APPLY_FILTERS' as const,
    payload: filters
  }),
  executeSearch: (immediate = false) => ({ type: 'SEARCH_EXECUTE' as const, payload: { immediate } }),

  };