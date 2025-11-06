export const MIN_SEARCH_LENGTH = 3;
export const DEBOUNCE_DELAY = 300;

export const ALLERGY_CATEGORIES = [
  'Crustáceos',
  'Mariscos',
  'Pescados',
  'Frutas',
  'Vegetales',
  'Frutos secos',
  'Árboles',
  'Hongos',
  'Animales'
] as const;

export type CategoryType = typeof ALLERGY_CATEGORIES[number];