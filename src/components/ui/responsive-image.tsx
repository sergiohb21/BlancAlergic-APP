import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Generate blur placeholder data URL
const generateBlurPlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 20; // Very small for placeholder
  canvas.height = Math.round((height / width) * 20);
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e5e7eb'; // Tailwind gray-200
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.1);
  }

  return '';
};

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Critical for emergency medical images
  className?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
  emergencyMode?: boolean; // Enhanced loading for emergency scenarios
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface ImageState {
  isLoading: boolean;
  hasError: boolean;
  isLoaded: boolean;
  retryCount: number;
}

const ResponsiveImage = React.forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({
    src,
    alt,
    width,
    height,
    priority = false,
    className,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality = 85,
    loading,
    placeholder = 'skeleton',
    blurDataURL,
    onLoad,
    onError,
    fallback,
    emergencyMode = false,
    fetchPriority,
  }, ref) => {
    const [imageState, setImageState] = React.useState<ImageState>({
      isLoading: true,
      hasError: false,
      isLoaded: false,
      retryCount: 0
    });

    const maxRetries = emergencyMode ? 3 : 2;
    const imgRef = React.useRef<HTMLImageElement>(null);

    // Enhanced loading strategy for medical emergencies
    const loadingStrategy = loading || (priority ? 'eager' : 'lazy');
    const fetchpriority = fetchPriority || (priority ? 'high' : 'auto');

    // Note: quality parameter would be used with image optimization services
    // in a production environment (e.g., Cloudinary, ImageKit, etc.)
    void quality; // Mark as used to avoid TypeScript warnings

    const handleLoad = React.useCallback(() => {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        hasError: false
      }));
      onLoad?.();
    }, [onLoad]);

    const handleError = React.useCallback(() => {
      const error = new Error(`Failed to load image: ${src}`);

      setImageState(prev => {
        if (prev.retryCount < maxRetries) {
          // Retry with exponential backoff for emergency images
          setTimeout(() => {
            if (imgRef.current) {
              imgRef.current.src = src;
            }
          }, Math.pow(2, prev.retryCount) * 1000);
          return { ...prev, retryCount: prev.retryCount + 1 };
        }
        return { ...prev, hasError: true, isLoading: false };
      });

      onError?.(error);
    }, [src, onError, maxRetries]);

    const retryLoad = React.useCallback(() => {
      setImageState(prev => ({ ...prev, hasError: false, retryCount: 0, isLoading: true }));
      if (imgRef.current) {
        imgRef.current.src = src;
      }
    }, [src]);

    // Generate optimized srcset for different screen sizes
    const generateSrcSet = React.useCallback(() => {
      const baseName = src.replace(/\.(jpg|jpeg|png)$/i, '');
      const extension = src.match(/\.(jpg|jpeg|png)$/i)?.[1];

      if (!extension) return src;

      const widths = [320, 640, 768, 1024, 1280];
      return widths
        .map(w => `${baseName}-${w}w.${extension} ${w}w`)
        .join(', ');
    }, [src]);

    // Generate WebP sources with fallback
    const generateWebPSources = React.useCallback(() => {
      const baseName = src.replace(/\.(jpg|jpeg|png)$/i, '');

      const widths = [320, 640, 768, 1024, 1280];
      return widths
        .map(w => `${baseName}-${w}w.webp ${w}w`)
        .join(', ');
    }, [src]);

    // Auto-generate blur placeholder if not provided and dimensions are available
    const blurPlaceholder = React.useMemo(() => {
      if (blurDataURL) return blurDataURL;
      if (placeholder === 'blur' && width && height) {
        return generateBlurPlaceholder(width, height);
      }
      return '';
    }, [blurDataURL, placeholder, width, height]);

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Loading State */}
        {imageState.isLoading && (
          <div className="absolute inset-0 z-10">
            {placeholder === 'skeleton' && (
              <Skeleton className="w-full h-full" />
            )}
            {placeholder === 'blur' && blurPlaceholder && (
              <div
                className="w-full h-full bg-cover bg-center filter blur-sm scale-110 transition-all duration-300"
                style={{ backgroundImage: `url(${blurPlaceholder})` }}
              />
            )}
            {emergencyMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando imagen médica...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {imageState.hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {emergencyMode ?
                  "Error crítico: Imagen de emergencia no disponible" :
                  "Error al cargar imagen"
                }
              </p>
              {imageState.retryCount < maxRetries && (
                <Button onClick={retryLoad} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Optimized Picture Element with WebP Support */}
        <picture>
          {/* WebP sources for modern browsers */}
          <source
            srcSet={generateWebPSources()}
            sizes={sizes}
            type="image/webp"
          />
          {/* Fallback to original format */}
          <img
            ref={ref || imgRef}
            src={src}
            srcSet={generateSrcSet()}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={loadingStrategy}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageState.isLoaded ? "opacity-100" : "opacity-0"
            )}
            {...(fetchpriority ? { fetchpriority } : {})}
          />
        </picture>

        {/* Fallback Content */}
        {fallback && imageState.hasError && (
          <div className="absolute inset-0 z-20">
            {fallback}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveImage.displayName = "ResponsiveImage";

export { ResponsiveImage };