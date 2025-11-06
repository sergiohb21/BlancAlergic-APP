import { describe, it, expect } from 'vitest';
import {
  MIN_SEARCH_LENGTH,
  DEBOUNCE_DELAY,
  ALLERGY_CATEGORIES,
} from '../utils/constants';

describe('Constants', () => {
  describe('Search Configuration', () => {
    it('should have correct minimum search length', () => {
      expect(MIN_SEARCH_LENGTH).toBe(3);
    });

    it('should have appropriate debounce delay', () => {
      expect(DEBOUNCE_DELAY).toBe(300);
    });
  });

  describe('Allergy Categories', () => {
    it('should contain all expected categories', () => {
      const expectedCategories = [
        'Crustáceos',
        'Mariscos',
        'Pescados',
        'Frutas',
        'Vegetales',
        'Frutos secos',
        'Árboles',
        'Hongos',
        'Animales'
      ];

      expect(ALLERGY_CATEGORIES).toHaveLength(expectedCategories.length);
      expectedCategories.forEach(category => {
        expect(ALLERGY_CATEGORIES).toContain(category);
      });
    });

    it('should have unique category names', () => {
      const uniqueCategories = [...new Set(ALLERGY_CATEGORIES)];
      expect(ALLERGY_CATEGORIES).toEqual(uniqueCategories);
    });

    it('should have properly typed categories', () => {
      ALLERGY_CATEGORIES.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });
});