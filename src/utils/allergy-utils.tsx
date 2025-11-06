import { AllergyIntensity } from '@/const/alergias';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

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
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'media':
    case 'medio':
      return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case 'baja':
    case 'bajo':
      return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    default:
      return null;
  }
}

export function getIntensityIconDetailed(intensity: string) {
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    case 'media':
    case 'medio':
      return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    case 'baja':
    case 'bajo':
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    default:
      return null;
  }
}

export function getIntensityColor(intensity: string) {
  switch (intensity.toLowerCase()) {
    case 'alta':
    case 'alto':
      return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
    case 'media':
    case 'medio':
      return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
    case 'baja':
    case 'bajo':
      return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20';
    default:
      return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20';
  }
}