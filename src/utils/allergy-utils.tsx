import { AllergyIntensity } from '@/const/alergias';
import { AlertTriangle, AlertCircle, X, Check, Info } from 'lucide-react';

export function getIntensityVariant(intensity: AllergyIntensity) {
  switch (intensity) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'default';
    case 'Baja':
      return 'secondary';
    default:
      return 'outline';
  }
}

// Color-blind safe status variants
export function getAllergyStatusVariant(isAlergic: boolean) {
  // Use blue for allergic (instead of red) and teal for safe (instead of green)
  return isAlergic ? 'destructive' : 'secondary';
}

// Get accessible color classes for color blindness
export function getAccessibleColorClasses(isAlergic: boolean, intensity?: AllergyIntensity | string) {
  if (!isAlergic) {
    // Safe items - use teal/blue tones instead of green
    return 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/20';
  }

  // Allergic items - use blue/purple tones instead of red
  if (intensity) {
    switch (intensity.toLowerCase()) {
      case 'alta':
      case 'alto':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20';
      case 'media':
      case 'medio':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
      case 'baja':
      case 'bajo':
        return 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20';
    }
  }

  return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
}

export function getIntensityVariantDetailed(intensity: string) {
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return 'destructive';
    case 'media':
    case 'medio':
      return 'default';
    case 'baja':
    case 'bajo':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function getIntensityIcon(intensity: AllergyIntensity | string) {
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
    case 'media':
    case 'medio':
      return <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
    case 'baja':
    case 'bajo':
      return <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />;
    default:
      return null;
  }
}

// Get clear allergy status icon (X for allergic, Check for safe)
export function getAllergyStatusIcon(isAlergic: boolean) {
  if (!isAlergic) {
    return <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
  }

  // For allergic items, show both X and intensity icon
  return <X className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
}

// Get accessible pattern styles for color blindness
export function getAccessiblePatternStyles(isAlergic: boolean) {
  if (isAlergic) {
    return {
      background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.05) 10px, rgba(59, 130, 246, 0.05) 20px)',
      borderStyle: 'dashed' as const,
    };
  }
  return {
    background: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(20, 184, 166, 0.05) 10px, rgba(20, 184, 166, 0.05) 20px)',
    borderStyle: 'solid' as const,
  };
}

export function getIntensityIconDetailed(intensity: string) {
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
    case 'media':
    case 'medio':
      return <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
    case 'baja':
    case 'bajo':
      return <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />;
    default:
      return null;
  }
}

export function getIntensityColor(intensity: string) {
  // Keep original for backward compatibility but mark as deprecated
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20';
    case 'media':
    case 'medio':
      return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
    case 'baja':
    case 'bajo':
      return 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20';
    default:
      return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20';
  }
}

// Get accessible text labels for screen readers
export function getAllergyStatusLabel(isAlergic: boolean, intensity?: AllergyIntensity | string) {
  if (!isAlergic) {
    return 'SEGURO PARA CONSUMIR';
  }

  if (intensity) {
    switch (intensity.toLowerCase()) {
      case 'alta':
      case 'alto':
        return 'ALÉRGICO - ALTA INTENSIDAD';
      case 'media':
      case 'medio':
        return 'ALÉRGICO - MEDIA INTENSIDAD';
      case 'baja':
      case 'bajo':
        return 'ALÉRGICO - BAJA INTENSIDAD';
      default:
        return 'ALÉRGICO';
    }
  }

  return 'ALÉRGICO';
}

// Get ARIA attributes for accessibility
export function getAllergyAriaProps(isAlergic: boolean, allergyName: string, intensity?: AllergyIntensity | string) {
  const status = getAllergyStatusLabel(isAlergic, intensity);

  return {
    'aria-label': status,
    'aria-describedby': `allergy-${allergyName.replace(/\s+/g, '-').toLowerCase()}-status`,
    'role': 'article',
  };
}

// Generate unique ID for allergy status description
export function getAllergyStatusId(allergyName: string) {
  return `allergy-${allergyName.replace(/\s+/g, '-').toLowerCase()}-status`;
}