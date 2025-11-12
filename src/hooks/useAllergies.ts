import { useApp } from './useApp';
import { useSearchResults } from './useSearchState';
import { AllergyCategory, AllergyIntensity } from '@/types/search';
import { logger } from '@/utils/logger';

type SortField = 'name' | 'category' | 'intensity' | 'KUA_Litro' | 'isAlergic';

export function useAllergies() {
  const { state, actions, dispatch } = useApp();
  const { results } = useSearchResults();

  return {
    allergies: state.allergies,
    // Map the new state structure to the old interface for backward compatibility
    filteredAllergies: results.length > 0 ? results : state.allergies.filter(a => a.isAlergic),
    searchQuery: state.search.query,
    selectedCategory: state.search.filters.category,
    selectedIntensity: state.search.filters.intensity,
    sortBy: state.sort.field,
    sortOrder: state.sort.order,
    isLoading: state.ui.isLoading,
    error: state.ui.error,
    // Map actions to maintain backward compatibility
    setAllergies: actions.setAllergies,
    setLoading: actions.setLoading,
    setError: actions.setError,
    setSearchQuery: (query: string) => actions.search.setQuery(query),
    setCategoryFilter: (category: AllergyCategory | 'all') => actions.search.setCategoryFilter(category),
    setIntensityFilter: (intensity: AllergyIntensity | 'all') => {
      // Dispatch the intensity filter action directly for now
      dispatch({ type: 'SEARCH_SET_INTENSITY_FILTER', payload: intensity });
    },
    setSortBy: (field: SortField) => actions.sort.setField(field),
    setSortOrder: (order: 'asc' | 'desc') => actions.sort.setOrder(order),
    filterAllergies: () => {
      // Trigger search with current filters
      logger.info('filterAllergies using new search architecture');
    },
  };
}