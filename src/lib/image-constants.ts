export const EMERGENCY_IMAGES = {
  'call-112': {
    priority: true,
    quality: 90,
    alt: "Botón de llamada de emergencia al 112",
    sizes: "(max-width: 768px) 100vw, 400px"
  },
  'epi-pen': {
    priority: true,
    quality: 90,
    alt: "Instrucciones de uso de EpiPen para emergencias alérgicas",
    sizes: "(max-width: 768px) 100vw, 400px"
  },
  'identify-symptoms': {
    priority: false,
    quality: 80,
    alt: "Guía de identificación de síntomas de reacciones alérgicas",
    sizes: "(max-width: 768px) 100vw, 500px"
  },
  'wait-help': {
    priority: false,
    quality: 80,
    alt: "Instrucciones para esperar ayuda médica en emergencia alérgica",
    sizes: "(max-width: 768px) 100vw, 600px"
  }
} as const;

export const FEATURE_IMAGES = {
  'card-1': {
    priority: false,
    quality: 75,
    alt: "Búsqueda de alergias en la aplicación",
    sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  },
  'card-2': {
    priority: false,
    quality: 75,
    alt: "Protocolo de emergencia para reacciones alérgicas",
    sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  },
  'card-3': {
    priority: false,
    quality: 75,
    alt: "Tabla completa de alergias registradas",
    sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  }
} as const;

// Emergency image paths for preloading
export const EMERGENCY_IMAGE_PATHS = [
  "/Image/call-112.jpg",
  "/Image/epi-pen.jpg"
] as const;