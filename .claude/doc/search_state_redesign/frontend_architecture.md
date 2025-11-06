# Frontend Architecture: Search State Management Redesign

## Executive Summary

This document provides a comprehensive architectural redesign for the search state management in BlancAlergic-APP, addressing the current fragmentation between local and global search states, performance issues, and future extensibility requirements.

## Current Architecture Problems

### 1. State Fragmentation Issues
```typescript
// CURRENT PROBLEM: Multiple sources of truth
// AppContext.tsx
interface AppState {
  searchQuery: string;
  selectedCategory: AllergyCategory | 'all';
  // ... other state
}

// InputSearch.tsx - Local states that duplicate global state
const [searchMode, setSearchMode] = useState<'name' | 'category'>('name');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [localQuery, setLocalQuery] = useState('');
```

### 2. Performance Issues Identified
- Unnecessary re-renders due to state synchronization
- Complex debouncing logic causing performance bottlenecks
- Redundant filtering operations in multiple components
- Inefficient state updates causing cascading re-renders

### 3. Maintainability Concerns
- Search logic scattered across components
- Manual synchronization between local and global state
- Inconsistent search behavior across different views
- Difficult to test and debug

## Proposed Architecture Solution

### 1. Unified SearchState Interface

```typescript
// Enhanced search state interface
export interface SearchState {
  // Core search parameters
  query: string;
  mode: 'name' | 'category' | 'advanced';

  // Filters
  filters: {
    category: AllergyCategory | 'all';
    intensity: AllergyIntensity | 'all';
    isAlergicOnly: boolean;
    showSafeFoods: boolean;
  };

  // Search behavior
  behavior: {
    minQueryLength: number;
    debounceDelay: number;
    includePartialMatches: boolean;
    caseSensitive: boolean;
  };

  // Results management
  results: {
    items: AlergiaType[];
    totalCount: number;
    filteredCount: number;
    isLoading: boolean;
    hasError: boolean;
    error?: string;
  };

  // Search history and suggestions (future features)
  metadata: {
    lastSearchTime: number;
    searchCount: number;
    recentSearches: string[];
    suggestions: string[];
  };

  // UI state
  ui: {
    isSearchActive: boolean;
    showAdvancedOptions: boolean;
    highlightedResultIndex: number;
    pagination?: {
      currentPage: number;
      itemsPerPage: number;
      totalPages: number;
    };
  };
}
```

### 2. Consolidated AppState Interface

```typescript
export interface AppState {
  // Data
  allergies: AlergiaType[];

  // Unified search state
  search: SearchState;

  // Sorting state
  sort: {
    field: keyof AlergiaType;
    order: 'asc' | 'desc';
  };

  // Global UI state
  ui: {
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
  };
}
```

### 3. Optimized Action Types

```typescript
// Search-related action types
type SearchAction =
  // Core search operations
  | { type: 'SEARCH_SET_QUERY'; payload: string }
  | { type: 'SEARCH_SET_MODE'; payload: 'name' | 'category' | 'advanced' }

  // Filter operations
  | { type: 'SEARCH_SET_CATEGORY_FILTER'; payload: AllergyCategory | 'all' }
  | { type: 'SEARCH_SET_INTENSITY_FILTER'; payload: AllergyIntensity | 'all' }
  | { type: 'SEARCH_SET_ALLERGIC_ONLY_FILTER'; payload: boolean }
  | { type: 'SEARCH_SET_SHOW_SAFE_FOODS_FILTER'; payload: boolean }

  // Search behavior
  | { type: 'SEARCH_SET_BEHAVIOR'; payload: Partial<SearchState['behavior']> }
  | { type: 'SEARCH_SET_DEBOUNCE_DELAY'; payload: number }

  // Results management
  | { type: 'SEARCH_START'; payload?: { query: string } }
  | { type: 'SEARCH_SUCCESS'; payload: { results: AlergiaType[]; totalCount: number } }
  | { type: 'SEARCH_ERROR'; payload: { error: string } }
  | { type: 'SEARCH_CLEAR' }

  // Search history (future)
  | { type: 'SEARCH_ADD_TO_HISTORY'; payload: string }
  | { type: 'SEARCH_CLEAR_HISTORY' }
  | { type: 'SEARCH_SET_SUGGESTIONS'; payload: string[] }

  // UI state
  | { type: 'SEARCH_SET_UI_ACTIVE'; payload: boolean }
  | { type: 'SEARCH_SET_ADVANCED_OPTIONS'; payload: boolean }
  | { type: 'SEARCH_SET_HIGHLIGHTED_INDEX'; payload: number }

  // Batch operations
  | { type: 'SEARCH_RESET_ALL' }
  | { type: 'SEARCH_APPLY_FILTERS'; payload: Partial<SearchState['filters']> }
  | { type: 'SEARCH_EXECUTE'; payload?: { immediate?: boolean } };

// Sort-related actions
type SortAction =
  | { type: 'SORT_SET_FIELD'; payload: keyof AlergiaType }
  | { type: 'SORT_SET_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SORT_TOGGLE_ORDER' }
  | { type: 'SORT_RESET' };

// Combined app action type
type AppAction = SearchAction | SortAction |
  | { type: 'SET_ALLERGIES'; payload: AlergiaType[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };
```

### 4. Enhanced Reducer Logic

```typescript
// Search reducers with performance optimizations
const searchReducer = (
  state: SearchState,
  action: SearchAction
): SearchState => {
  switch (action.type) {
    case 'SEARCH_SET_QUERY':
      return {
        ...state,
        query: action.payload,
        ui: {
          ...state.ui,
          isSearchActive: action.payload.length > 0,
          highlightedResultIndex: -1
        }
      };

    case 'SEARCH_SET_MODE':
      return {
        ...state,
        mode: action.payload,
        // Reset dependent state when mode changes
        query: action.payload === 'category' ? state.query : '',
        ui: {
          ...state.ui,
          highlightedResultIndex: -1
        }
      };

    case 'SEARCH_START':
      return {
        ...state,
        results: {
          ...state.results,
          isLoading: true,
          hasError: false,
          error: undefined
        }
      };

    case 'SEARCH_SUCCESS':
      return {
        ...state,
        results: {
          items: action.payload.results,
          totalCount: action.payload.totalCount,
          filteredCount: action.payload.results.length,
          isLoading: false,
          hasError: false,
          error: undefined
        },
        metadata: {
          ...state.metadata,
          lastSearchTime: Date.now(),
          searchCount: state.metadata.searchCount + 1
        }
      };

    case 'SEARCH_ERROR':
      return {
        ...state,
        results: {
          ...state.results,
          isLoading: false,
          hasError: true,
          error: action.payload.error
        }
      };

    case 'SEARCH_SET_CATEGORY_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          category: action.payload
        }
      };

    case 'SEARCH_RESET_ALL':
      return {
        ...initialSearchState,
        metadata: {
          ...initialSearchState.metadata,
          searchCount: state.metadata.searchCount // Preserve search count
        }
      };

    default:
      return state;
  }
};

// Main app reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  // Handle search-specific actions
  if ('type' in action && action.type.startsWith('SEARCH_')) {
    return {
      ...state,
      search: searchReducer(state.search, action as SearchAction)
    };
  }

  // Handle other actions
  switch (action.type) {
    case 'SET_ALLERGIES':
      return {
        ...state,
        allergies: action.payload
      };

    // ... other action handlers
    default:
      return state;
  }
};
```

### 5. Performance-Optimized Selectors

```typescript
// Memoized selectors for optimal performance
export const searchSelectors = {
  // Basic selectors
  getQuery: (state: AppState) => state.search.query,
  getSearchMode: (state: AppState) => state.search.mode,
  getFilters: (state: AppState) => state.search.filters,
  getResults: (state: AppState) => state.search.results,

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
      let filtered = allergies;

      // Apply search logic based on mode
      if (mode === 'name' && query) {
        filtered = filtered.filter(allergy =>
          allergy.name.toLowerCase().includes(query.toLowerCase())
        );
      } else if (mode === 'category' && filters.category !== 'all') {
        filtered = filtered.filter(allergy =>
          allergy.category === filters.category
        );
      }

      // Apply filters
      if (filters.isAlergicOnly) {
        filtered = filtered.filter(allergy => allergy.isAlergic);
      }

      if (filters.intensity !== 'all') {
        filtered = filtered.filter(allergy => allergy.intensity === filters.intensity);
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
      (state: AppState) => state.allergies
    ],
    (results, allAllergies) => ({
      resultCount: results.length,
      totalCount: allAllergies.length,
      allergenicCount: results.filter(r => r.isAlergic).length,
      safeCount: results.filter(r => !r.isAlergic).length
    })
  )
};
```

### 6. Custom Hooks for Search Operations

```typescript
// Optimized custom hooks
export const useSearchState = () => {
  const { state, actions } = useApp();

  return {
    searchState: state.search,
    searchActions: {
      setQuery: actions.search.setQuery,
      setMode: actions.search.setMode,
      setFilters: actions.search.setFilters,
      clearSearch: actions.search.clear,
      executeSearch: actions.search.execute
    }
  };
};

export const useSearchResults = () => {
  const { state } = useApp();
  const searchResults = searchSelectors.getFilteredAllergies(state);
  const searchStats = searchSelectors.getSearchStats(state);

  return {
    results: searchResults,
    stats: searchStats,
    isLoading: state.search.results.isLoading,
    hasError: state.search.results.hasError,
    error: state.search.results.error
  };
};

// Debounced search hook
export const useDebouncedSearch = (delay: number = 300) => {
  const { searchActions } = useSearchState();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery) {
        searchActions.executeSearch({ immediate: false });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [debouncedQuery, delay, searchActions]);

  return {
    setDebouncedQuery,
    debouncedQuery
  };
};
```

## Migration Strategy

### Phase 1: Backend State Architecture
1. Create new interfaces and types
2. Implement enhanced reducers
3. Add performance-optimized selectors
4. Create custom hooks

### Phase 2: Component Migration
1. **InputSearch.tsx** - Remove local states, use global search hooks
2. **TableView.tsx** - Use filtered results from selectors
3. **EmergencyView.tsx** - No changes needed
4. **Layout.tsx** - Update to use new state structure

### Phase 3: Performance Optimization
1. Implement React.memo for components
2. Add useMemo for expensive computations
3. Optimize re-render patterns
4. Add performance monitoring

## Performance Optimizations

### 1. State Updates
- Batch multiple state updates
- Use useCallback for action creators
- Implement selective updates to prevent unnecessary re-renders

### 2. Computation Optimization
- Memoize expensive filtering operations
- Use virtualization for large result lists
- Implement efficient sorting algorithms

### 3. Rendering Optimization
- Component memoization with custom comparison functions
- Lazy loading for search results
- Optimistic updates for better UX

## Future Extensibility

### 1. Advanced Search Features
- Search history with local storage
- Search suggestions and autocomplete
- Saved search configurations
- Advanced filtering combinations

### 2. Analytics and Monitoring
- Search usage analytics
- Performance metrics
- Error tracking
- A/B testing framework

### 3. Accessibility Features
- Keyboard navigation for search results
- Screen reader optimizations
- Voice search integration
- High contrast mode support

## Implementation Checklist

### Files to Create:
- `src/types/search.ts` - Search-related type definitions
- `src/hooks/useSearchState.ts` - Search state management hook
- `src/hooks/useDebouncedSearch.ts` - Debounced search hook
- `src/utils/searchSelectors.ts` - Memoized selectors
- `src/utils/searchHelpers.ts` - Search utility functions

### Files to Modify:
- `src/contexts/AppContext.tsx` - Enhanced context with SearchState
- `src/components/InputSearch.tsx` - Remove local states, use hooks
- `src/components/TableView.tsx` - Use new search selectors
- `src/Layaout.tsx` - Update context usage

### Testing Requirements:
- Unit tests for reducers and selectors
- Integration tests for search hooks
- Component tests for search UI
- Performance benchmarks

This architecture provides a robust, performant, and extensible foundation for search state management while maintaining backward compatibility and following React best practices.