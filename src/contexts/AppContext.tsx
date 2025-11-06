import React, { createContext, useReducer, ReactNode, useMemo } from 'react';
import { AlergiaType, AllergyIntensity, AllergyCategory } from '@/const/alergias';

// Tipos para el estado de la aplicación
export interface AppState {
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

// Tipos de acciones
type AppAction =
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

// Estado inicial
const initialState: AppState = {
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

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
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

// Contexto
export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
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

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
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
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

