import { useApp } from './useApp';

export function useAllergies() {
  const { state, actions } = useApp();
  return {
    allergies: state.allergies,
    filteredAllergies: state.filteredAllergies,
    searchQuery: state.searchQuery,
    selectedCategory: state.selectedCategory,
    selectedIntensity: state.selectedIntensity,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    isLoading: state.isLoading,
    error: state.error,
    ...actions
  };
}