import { AlergiaType, AllergyCategory, AllergyIntensity } from '@/const/alergias';

// Re-export types for broader use
export type { AllergyCategory, AllergyIntensity } from '@/const/alergias';

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

// Consolidated AppState interface
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

// Search-related action types
export type SearchAction =
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
export type SortAction =
  | { type: 'SORT_SET_FIELD'; payload: keyof AlergiaType }
  | { type: 'SORT_SET_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SORT_TOGGLE_ORDER' }
  | { type: 'SORT_RESET' };

// Combined app action type
export type AppAction = SearchAction | SortAction
  | { type: 'SET_ALLERGIES'; payload: AlergiaType[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };

// Initial search state
export const initialSearchState: SearchState = {
  query: '',
  mode: 'name',
  filters: {
    category: 'all',
    intensity: 'all',
    isAlergicOnly: false,
    showSafeFoods: true,
  },
  behavior: {
    minQueryLength: 4,
    debounceDelay: 300,
    includePartialMatches: false,
    caseSensitive: false,
  },
  results: {
    items: [],
    totalCount: 0,
    filteredCount: 0,
    isLoading: false,
    hasError: false,
  },
  metadata: {
    lastSearchTime: 0,
    searchCount: 0,
    recentSearches: [],
    suggestions: [],
  },
  ui: {
    isSearchActive: false,
    showAdvancedOptions: false,
    highlightedResultIndex: -1,
  },
};