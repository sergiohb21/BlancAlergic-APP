import { describe, it, expect } from 'vitest';
import { AllergyIntensity } from '@/const/alergias';
import {
  getIntensityVariant,
  getIntensityIcon,
  getAccessibleColorClasses,
  getAllergyAriaProps,
  getAllergyStatusLabel,
} from '../utils/allergy-utils';

describe('Allergy Utils', () => {
  describe('getIntensityVariant', () => {
    it('should return correct variant for Alta intensity', () => {
      expect(getIntensityVariant('Alta')).toBe('destructive');
    });

    it('should return correct variant for Media intensity', () => {
      expect(getIntensityVariant('Media')).toBe('default');
    });

    it('should return correct variant for Baja intensity', () => {
      expect(getIntensityVariant('Baja')).toBe('secondary');
    });

    it('should return outline for unknown intensity', () => {
      expect(getIntensityVariant('Baja' as AllergyIntensity)).toBe('secondary');
    });
  });

  describe('getIntensityIcon', () => {
    it('should return correct icon for Alta intensity', () => {
      expect(getIntensityIcon('Alta')).toBeDefined();
    });

    it('should return correct icon for Media intensity', () => {
      expect(getIntensityIcon('Media')).toBeDefined();
    });

    it('should return correct icon for Baja intensity', () => {
      expect(getIntensityIcon('Baja')).toBeDefined();
    });

    it('should return default icon for unknown intensity', () => {
      expect(getIntensityIcon('Unknown')).toBeDefined();
    });
  });

  describe('getAccessibleColorClasses', () => {
    it('should return high contrast classes for allergic Alta intensity', () => {
      const classes = getAccessibleColorClasses(true, 'Alta');
      expect(classes).toContain('border-purple-200');
      expect(classes).toContain('bg-purple-50');
    });

    it('should return medium contrast classes for allergic Media intensity', () => {
      const classes = getAccessibleColorClasses(true, 'Media');
      expect(classes).toContain('border-blue-200');
      expect(classes).toContain('bg-blue-50');
    });

    it('should return low contrast classes for allergic Baja intensity', () => {
      const classes = getAccessibleColorClasses(true, 'Baja');
      expect(classes).toContain('border-indigo-200');
      expect(classes).toContain('bg-indigo-50');
    });

    it('should return safe classes for non-allergic items', () => {
      const classes = getAccessibleColorClasses(false);
      expect(classes).toContain('border-teal-200');
      expect(classes).toContain('bg-teal-50');
    });

    it('should return default classes for unknown intensity', () => {
      const classes = getAccessibleColorClasses(true, 'Unknown');
      expect(classes).toContain('border-slate-200');
      expect(classes).toContain('bg-slate-50');
    });
  });

  describe('getAllergyAriaProps', () => {
    it('should return correct ARIA props for Alta intensity allergy', () => {
      const props = getAllergyAriaProps(true, 'Cacahuetes', 'Alta');
      expect(props['aria-label']).toBe('ALÉRGICO - ALTA INTENSIDAD');
      expect(props.role).toBe('article');
      expect(props['aria-describedby']).toBe('allergy-cacahuetes-status');
    });

    it('should return correct ARIA props for Media intensity allergy', () => {
      const props = getAllergyAriaProps(true, 'Frutos secos', 'Media');
      expect(props['aria-label']).toBe('ALÉRGICO - MEDIA INTENSIDAD');
      expect(props.role).toBe('article');
      expect(props['aria-describedby']).toBe('allergy-frutos-secos-status');
    });

    it('should return correct ARIA props for Baja intensity allergy', () => {
      const props = getAllergyAriaProps(true, 'Lácteos', 'Baja');
      expect(props['aria-label']).toBe('ALÉRGICO - BAJA INTENSIDAD');
      expect(props.role).toBe('article');
      expect(props['aria-describedby']).toBe('allergy-lácteos-status');
    });

    it('should return safe status for non-allergic items', () => {
      const props = getAllergyAriaProps(false, 'Manzana');
      expect(props['aria-label']).toBe('SEGURO PARA CONSUMIR');
      expect(props.role).toBe('article');
      expect(props['aria-describedby']).toBe('allergy-manzana-status');
    });
  });

  describe('getAllergyStatusLabel', () => {
    it('should return Alta intensity label', () => {
      const label = getAllergyStatusLabel(true, 'Alta');
      expect(label).toBe('ALÉRGICO - ALTA INTENSIDAD');
    });

    it('should return Media intensity label', () => {
      const label = getAllergyStatusLabel(true, 'Media');
      expect(label).toBe('ALÉRGICO - MEDIA INTENSIDAD');
    });

    it('should return Baja intensity label', () => {
      const label = getAllergyStatusLabel(true, 'Baja');
      expect(label).toBe('ALÉRGICO - BAJA INTENSIDAD');
    });

    it('should return basic allergic label for unknown intensity', () => {
      const label = getAllergyStatusLabel(true, 'Unknown');
      expect(label).toBe('ALÉRGICO');
    });

    it('should return safe label for non-allergic items', () => {
      const label = getAllergyStatusLabel(false);
      expect(label).toBe('SEGURO PARA CONSUMIR');
    });
  });
});