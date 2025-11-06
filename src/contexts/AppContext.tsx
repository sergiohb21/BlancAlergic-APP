import React, { createContext, useReducer, ReactNode, useMemo } from 'react';
import { AlergiaType, AllergyIntensity, AllergyCategory } from '@/const/alergias';
import { AppState, AppAction, SearchAction, SortAction, initialSearchState } from '@/types/search';

// Legacy interface for backward compatibility
export interface LegacyAppState {
  allergies: AlergiaType[];
  filteredAllergies: AlergiaType[];
  searchQuery: string;
  selectedCategory: AllergyCategory | 'all';
  selectedIntensity: AllergyIntensity | 'all';
  sortBy: keyof AlergiaType;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
}

// Legacy action types for backward compatibility
type LegacyAppAction =
  | { type: 'SET_ALLERGIES'; payload: AlergiaType[] }
  | { type: 'SET_FILTERED_ALLERGIES'; payload: AlergiaType[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: AllergyCategory | 'all' }
  | { type: 'SET_INTENSITY_FILTER'; payload: AllergyIntensity | 'all' }
  | { type: 'SET_SORT'; payload: { field: keyof AlergiaType; order: 'asc' | 'desc' } }
  | { type: 'SET_SORT_BY'; payload: keyof AlergiaType }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'FILTER_ALLERGIES' }
  | { type: 'RESET_FILTERS' };

// New consolidated state
const initialState: AppState = {
  allergies: [],
  search: initialSearchState,
  sort: {
    field: 'name',
    order: 'asc',
  },
  ui: {
    isLoading: false,
    error: null,
    theme: 'light',
  },
};

// Legacy state for backward compatibility
const legacyInitialState: LegacyAppState = {
  allergies: [],
  filteredAllergies: [],
  searchQuery: '',
  selectedCategory: 'all',
  selectedIntensity: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  isLoading: false,
  error: null,
};

// New consolidated reducer
function appReducer(state: AppState, action: AppAction): AppState {
  // Handle search-specific actions
  if ('type' in action && action.type.startsWith('SEARCH_')) {
    return {
      ...state,
      search: searchReducer(state.search, action as SearchAction)
    };
  }

  // Handle sort actions
  if (action.type.startsWith('SORT_')) {
    return {
      ...state,
      sort: sortReducer(state.sort, action as SortAction)
    };
  }

  // Handle other actions
  switch (action.type) {
    case 'SET_ALLERGIES':
      return {
        ...state,
        allergies: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload
        }
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };

    default:
      return state;
  }
}

// Search reducer
function searchReducer(search: AppState['search'], action: SearchAction): AppState['search'] {
  switch (action.type) {
    case 'SEARCH_SET_QUERY':
      return {
        ...search,
        query: action.payload,
        ui: {
          ...search.ui,
          isSearchActive: action.payload.length > 0,
          highlightedResultIndex: -1
        }
      };

    case 'SEARCH_SET_MODE':
      return {
        ...search,
        mode: action.payload,
        // Reset dependent state when mode changes
        query: action.payload === 'category' ? search.query : '',
        ui: {
          ...search.ui,
          highlightedResultIndex: -1
        }
      };

    case 'SEARCH_SET_CATEGORY_FILTER':
      return {
        ...search,
        filters: {
          ...search.filters,
          category: action.payload
        }
      };

    case 'SEARCH_SET_INTENSITY_FILTER':
      return {
        ...search,
        filters: {
          ...search.filters,
          intensity: action.payload
        }
      };

    case 'SEARCH_RESET_ALL':
      return {
        ...initialSearchState,
        metadata: {
          ...initialSearchState.metadata,
          searchCount: search.metadata.searchCount // Preserve search count
        }
      };

    case 'SEARCH_CLEAR':
      return {
        ...search,
        query: '',
        mode: 'name',
        ui: {
          ...search.ui,
          isSearchActive: false,
          highlightedResultIndex: -1
        }
      };

    case 'SEARCH_SET_UI_ACTIVE':
      return {
        ...search,
        ui: {
          ...search.ui,
          isSearchActive: action.payload
        }
      };

    default:
      return search;
  }
}

// Sort reducer
function sortReducer(sort: AppState['sort'], action: SortAction): AppState['sort'] {
  switch (action.type) {
    case 'SORT_SET_FIELD':
      return {
        ...sort,
        field: action.payload
      };

    case 'SORT_SET_ORDER':
      return {
        ...sort,
        order: action.payload
      };

    case 'SORT_TOGGLE_ORDER':
      return {
        ...sort,
        order: sort.order === 'asc' ? 'desc' : 'asc'
      };

    default:
      return sort;
  }
}

// Legacy reducer for backward compatibility
function legacyAppReducer(state: LegacyAppState, action: LegacyAppAction): LegacyAppState {
  switch (action.type) {
    case 'SET_ALLERGIES':
      return { ...state, allergies: action.payload };

    case 'SET_FILTERED_ALLERGIES':
      return { ...state, filteredAllergies: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_CATEGORY_FILTER':
      return { ...state, selectedCategory: action.payload };

    case 'SET_INTENSITY_FILTER':
      return { ...state, selectedIntensity: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.field,
        sortOrder: action.payload.order
      };

    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload
      };

    case 'SET_SORT_ORDER':
      return {
        ...state,
        sortOrder: action.payload
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'FILTER_ALLERGIES': {
      const { allergies, searchQuery, selectedCategory, selectedIntensity, sortBy, sortOrder } = state;

      let filtered = allergies.filter(allergy =>
        allergy.isAlergic &&
        (searchQuery === '' || allergy.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategory === 'all' || allergy.category === selectedCategory) &&
        (selectedIntensity === 'all' || allergy.intensity === selectedIntensity)
      );

      // Ordenar resultados
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });

      return { ...state, filteredAllergies: filtered };
    }

    case 'RESET_FILTERS':
      return {
        ...state,
        searchQuery: '',
        selectedCategory: 'all',
        selectedIntensity: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
      };

    default:
      return state;
  }
}

// New consolidated context
export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setAllergies: (allergies: AlergiaType[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    search: {
      setQuery: (query: string) => void;
      setMode: (mode: 'name' | 'category' | 'advanced') => void;
      setCategoryFilter: (category: AllergyCategory | 'all') => void;
      clearSearch: () => void;
      resetAll: () => void;
    };
    sort: {
      setField: (field: keyof AlergiaType) => void;
      setOrder: (order: 'asc' | 'desc') => void;
      toggleOrder: () => void;
    };
  };
} | null>(null);

// Legacy context for backward compatibility
export const LegacyAppContext = createContext<{
  state: LegacyAppState;
  dispatch: React.Dispatch<LegacyAppAction>;
  actions: {
    setAllergies: (allergies: AlergiaType[]) => void;
    setSearchQuery: (query: string) => void;
    setCategoryFilter: (category: AllergyCategory | 'all') => void;
    setIntensityFilter: (intensity: AllergyIntensity | 'all') => void;
    setSort: (field: keyof AlergiaType, order: 'asc' | 'desc') => void;
    setSortBy: (field: keyof AlergiaType) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    filterAllergies: () => void;
    resetFilters: () => void;
  };
} | null>(null);

// New consolidated provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(() => ({
    setAllergies: (allergies: AlergiaType[]) => {
      dispatch({ type: 'SET_ALLERGIES', payload: allergies });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    setTheme: (theme: 'light' | 'dark') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },

    search: {
      setQuery: (query: string) => {
        dispatch({ type: 'SEARCH_SET_QUERY', payload: query });
      },

      setMode: (mode: 'name' | 'category' | 'advanced') => {
        dispatch({ type: 'SEARCH_SET_MODE', payload: mode });
      },

      setCategoryFilter: (category: AllergyCategory | 'all') => {
        dispatch({ type: 'SEARCH_SET_CATEGORY_FILTER', payload: category });
      },

      clearSearch: () => {
        dispatch({ type: 'SEARCH_CLEAR' });
      },

      resetAll: () => {
        dispatch({ type: 'SEARCH_RESET_ALL' });
      }
    },

    sort: {
      setField: (field: keyof AlergiaType) => {
        dispatch({ type: 'SORT_SET_FIELD', payload: field });
      },

      setOrder: (order: 'asc' | 'desc') => {
        dispatch({ type: 'SORT_SET_ORDER', payload: order });
      },

      toggleOrder: () => {
        dispatch({ type: 'SORT_TOGGLE_ORDER' });
      }
    }
  }), [dispatch]);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Legacy provider for backward compatibility
export function LegacyAppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(legacyAppReducer, legacyInitialState);

  const actions = useMemo(() => ({
    setAllergies: (allergies: AlergiaType[]) => {
      dispatch({ type: 'SET_ALLERGIES', payload: allergies });
    },

    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },

    setCategoryFilter: (category: AllergyCategory | 'all') => {
      dispatch({ type: 'SET_CATEGORY_FILTER', payload: category });
    },

    setIntensityFilter: (intensity: AllergyIntensity | 'all') => {
      dispatch({ type: 'SET_INTENSITY_FILTER', payload: intensity });
    },

    setSort: (field: keyof AlergiaType, order: 'asc' | 'desc') => {
      dispatch({ type: 'SET_SORT', payload: { field, order } });
    },

    setSortBy: (field: keyof AlergiaType) => {
      dispatch({ type: 'SET_SORT_BY', payload: field });
    },

    setSortOrder: (order: 'asc' | 'desc') => {
      dispatch({ type: 'SET_SORT_ORDER', payload: order });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    filterAllergies: () => {
      dispatch({ type: 'FILTER_ALLERGIES' });
    },

    resetFilters: () => {
      dispatch({ type: 'RESET_FILTERS' });
    }
  }), [dispatch]);

  return (
    <LegacyAppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </LegacyAppContext.Provider>
  );
}