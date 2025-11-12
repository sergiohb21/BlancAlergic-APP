import { logger } from '@/utils/logger';

export interface ImageConfig {
  quality: number;
  format: string[];
  breakpoints: number[];
  placeholder: 'blur' | 'skeleton' | 'empty';
}

export const EMERGENCY_IMAGE_CONFIG: ImageConfig = {
  quality: 90, // Medical accuracy requirement
  format: ['webp', 'jpg'], // Progressive enhancement
  breakpoints: [320, 400, 640, 768],
  placeholder: 'skeleton'
};

export const STANDARD_IMAGE_CONFIG: ImageConfig = {
  quality: 80,
  format: ['webp', 'jpg'],
  breakpoints: [320, 640, 768, 1024],
  placeholder: 'blur'
};

export const generateImageSrcSet = (
  basePath: string,
  widths: number[],
  format: 'webp' | 'avif' | 'jpg'
): string => {
  return widths
    .map(width => `${basePath}-${width}w.${format} ${width}w`)
    .join(', ');
};

export const getOptimalQuality = (
  isEmergency: boolean,
  connectionType?: string
): number => {
  if (isEmergency) return 90; // Medical accuracy for emergency content

  // Adaptive quality based on connection
  switch (connectionType) {
    case 'slow-2g': return 60;
    case '2g': return 70;
    case '3g': return 80;
    default: return 85;
  }
};

export const createBlurPlaceholder = (
  width: number,
  height: number
): string => {
  // Generate optimized low-quality placeholder for blur-up effect
  const canvas = document.createElement('canvas');
  canvas.width = 20; // Very small for placeholder
  canvas.height = Math.round((height / width) * 20);
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e5e7eb'; // Tailwind gray-200
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  return '';
};

// Connection detection for adaptive loading
export const getConnectionType = (): string => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
      mozConnection?: { effectiveType?: string };
      webkitConnection?: { effectiveType?: string };
    };
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    return connection?.effectiveType || '4g';
  }
  return '4g';
};

// Preload critical emergency images
export const preloadEmergencyImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload emergency image: ${src}`));
    img.src = src;
  });
};

// Emergency image preloader for critical medical content
export const preloadCriticalImages = async (imagePaths: string[]): Promise<void> => {
  try {
    await Promise.all(imagePaths.map(path => preloadEmergencyImage(path)));
    logger.debug('All critical emergency images preloaded');
  } catch (error) {
    logger.error({ error, imagePaths }, 'Failed to preload emergency images');
  }
};