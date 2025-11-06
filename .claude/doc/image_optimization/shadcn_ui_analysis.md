# shadcn/ui Image Component Analysis

## Current State Analysis

Based on the BlancAlergic-APP codebase review, I can see:

1. **Existing shadcn/ui Components**: The project already uses shadcn/ui components (Card, Button, etc.) with proper import paths and styling conventions
2. **Image Implementation**: Currently using basic `<img>` tags without optimization
3. **Component Structure**: Well-organized with proper TypeScript interfaces and memoization

## Recommended shadcn/ui-Based ResponsiveImage Component

### Component Architecture
The ResponsiveImage component should follow shadcn/ui patterns:

```typescript
// Component location: /src/components/ui/responsive-image.tsx
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // For above-the-fold emergency images
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode; // For error states
}
```

### Key Features to Implement

1. **WebP Support with Fallbacks**
   - Automatic WebP format detection
   - Fallback to original format (JPG/PNG)
   - AVIF support for modern browsers

2. **Responsive Image Handling**
   - Automatic srcset generation for different screen sizes
   - Sizes attribute optimization
   - Device pixel ratio consideration

3. **Progressive Loading**
   - Skeleton loading states using shadcn/ui Skeleton component
   - Blur-up effect for priority images
   - Intersection Observer for lazy loading

4. **Error Handling & Retry Logic**
   - Automatic retry mechanism for failed loads
   - Custom fallback components
   - Error reporting for monitoring

5. **Performance Optimization**
   - Preloading for critical emergency images
   - Proper caching headers
   - Resource hints (preload, prefetch)

### Integration with shadcn/ui Design System

1. **Styling Consistency**
   - Use `cn()` utility from `@/lib/utils`
   - Follow shadcn/ui className conventions
   - Integrates with existing Card components

2. **Theme Support**
   - Dark/light theme compatibility
   - CSS variable usage for consistency
   - Proper color contrast for accessibility

3. **Component Composition**
   - Works seamlessly with existing Card, Button components
   - Proper TypeScript interfaces
   - Memoization for performance

### Medical Emergency Considerations

1. **Priority Loading for Emergency Images**
   - Emergency call button images should have `priority={true}`
   - No lazy loading for critical medical instructions
   - Preconnect to image domains

2. **Accessibility Enhancements**
   - Proper alt text handling
   - Screen reader announcements
   - High contrast fallbacks

3. **Offline Support**
   - Service worker caching strategies
   - Offline fallback images
   - Progressive Web App integration

### File Structure Recommendations

```
src/
├── components/ui/
│   ├── responsive-image.tsx      # Main ResponsiveImage component
│   ├── image-skeleton.tsx        # Skeleton loading component
│   └── image-error-boundary.tsx  # Error boundary for images
├── lib/
│   ├── image-utils.ts            # Image optimization utilities
│   └── image-constants.ts        # Image configuration constants
└── types/
    └── image.ts                  # Image-related TypeScript types
```

### Implementation Priority

1. **Phase 1**: Core ResponsiveImage component with WebP support
2. **Phase 2**: Progressive loading and error handling
3. **Phase 3**: Performance monitoring and advanced features
4. **Phase 4**: Offline support and PWA integration

## Technical Considerations

### Browser Support
- WebP: ~95% browser support
- AVIF: ~75% browser support (progressive enhancement)
- Intersection Observer: Modern browsers with polyfill

### Performance Metrics
- LCP (Largest Contentful Paint) optimization
- CLS (Cumulative Layout Shift) prevention
- Memory usage considerations

### Security
- CSP (Content Security Policy) compatibility
- XSS prevention in alt text
- Safe error message handling

## Next Steps

1. Create the base ResponsiveImage component following shadcn/ui patterns
2. Implement WebP/AVIF support with proper fallbacks
3. Add progressive loading with skeleton states
4. Integrate with existing EmergencyView component
5. Test performance improvements and accessibility compliance