/**
 * Application constants
 * Centralized configuration for values used throughout the app
 */

// Search and filtering
export const MIN_SEARCH_LENGTH = 3;
export const DEBOUNCE_DELAY = 300;

// Emergency and medical constants
export const EMERGENCY_PHONE = '112';
export const EMERGENCY_PHONE_TEL = `tel:${EMERGENCY_PHONE}`;

// Application paths and routing
export const APP_BASE_PATH = '/BlancAlergic-APP';
export const APP_NAME = 'BlancAlergic-APP';
export const APP_DISPLAY_NAME = 'BlancALergias';

// Emergency step IDs
export const EMERGENCY_STEP_IDS = {
  CALL_EMERGENCY: 'llamar-112',
  SYMPTOMS: 'sintomas',
  EPIPEN: 'epipen',
  WAIT_HELP: 'esperar-ayuda'
} as const;

// Theme storage key
export const THEME_STORAGE_KEY = 'blancalergic-theme';

// Image paths
export const IMAGE_PATHS = {
  CALL_EMERGENCY: '/Image/call-112.jpg',
  EPIPEN: '/Image/epipen.jpg',
  APP_ICONS: {
    ICON_192: 'icons/icon-192x192.png',
    ICON_512: 'icons/icon-512x512.png'
  }
} as const;

// Contact and sharing
export const WHATSAPP_SHARE_MESSAGE = `🚨 ¡Alerta de Alergias! 🚨

¡Hey! ¿Sabías que Blanca tiene una app exclusiva para manejar sus alergias? 🌟
Si alguna vez te has preguntado si esa comida que vas a preparar le hará ver las estrellas 🌟 o visitar el hospital 🚑, ¡esta app es la solución!

🔗 Échale un vistazo aquí: https://sergiohb21.github.io/BlancAlergic-APP/

¡Comparte y mantén a Blanca libre de sorpresas indeseadas! 🎉`;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;

// Blood types for medical forms
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

// Allergy categories and types
export const ALLERGY_CATEGORIES = [
  'Crustáceos',
  'Mariscos',
  'Pescados',
  'Frutas',
  'Vegetales',
  'Frutos secos',
  'Árboles',
  'Hongos',
  'Animales',
  'Especias',
  'Semillas',
  'Proteinas'
] as const;

export type CategoryType = typeof ALLERGY_CATEGORIES[number];

// Allergy intensity levels
export const ALLERGY_INTENSITY_LEVELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta'
} as const;

export type AllergyIntensityType = typeof ALLERGY_INTENSITY_LEVELS[keyof typeof ALLERGY_INTENSITY_LEVELS];

// Medical test types
export const MEDICAL_TEST_TYPES = [
  'skin-prick',
  'blood-test',
  'oral-challenge',
  'patch-test'
] as const;

// Risk levels for cross-reactivity
export const RISK_LEVELS = [
  'low',
  'moderate',
  'high'
] as const;

// Sync status for data synchronization
export const SYNC_STATUS = {
  SYNCED: 'synced',
  SYNCING: 'syncing',
  ERROR: 'error',
  OFFLINE: 'offline'
} as const;

// Default form values
export const DEFAULT_FORM_VALUES = {
  displayName: '',
  email: '',
  phone: '',
  birthDate: '',
  emergencyContact: '',
  emergencyPhone: '',
  bloodType: '',
  medicalNotes: ''
} as const;

// Loading and animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  THEME_TRANSITION: 300,
  LOADING_DELAY: 500,
  BUTTON_HOVER: 150
} as const;

// Accessibility breakpoints
export const ACCESSIBILITY_BREAKPOINTS = {
  MIN_TOUCH_TARGET: 44, // Minimum touch target size in pixels
  MAX_WIDTH_MOBILE: 768
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  LOAD_ERROR: 'Error al cargar los datos. Por favor, inténtalo de nuevo.',
  SAVE_ERROR: 'Error al guardar los datos. Por favor, inténtalo de nuevo.',
  UPLOAD_ERROR: 'Error al subir el archivo. Verifica que sea una imagen válida.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_SAVED: 'Perfil actualizado correctamente.',
  PHOTO_UPLOADED: 'Foto de perfil actualizada correctamente.',
  DATA_SAVED: 'Datos guardados correctamente.',
  SYNC_COMPLETED: 'Sincronización completada.'
} as const;