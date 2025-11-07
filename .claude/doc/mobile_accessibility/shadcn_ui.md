# Mobile Accessibility Implementation Plan

## Date: 2025-11-07
## Feature: Mobile Accessibility and UI Improvements

### Executive Summary

This document provides specific, implementable solutions for the mobile accessibility issues identified in the BlancAlergic-APP. The plan focuses on practical code improvements that maintain the existing design system while ensuring WCAG 2.1 AA compliance and optimal mobile user experience.

## 1. Mobile Button Layout Improvements

### A. MedicalDashboard.tsx - Lines 135-154

**Current Issues:**
- Buttons use `size="sm"` which creates touch targets smaller than 44x44px
- No mobile-specific responsive behavior
- Missing ARIA labels for screen readers
- No keyboard navigation support

**Recommended Implementation:**

```typescript
// Replace existing button container (lines 135-154)
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button
    variant="outline"
    size="default" // Mobile: default size, Desktop: sm size via responsive classes
    onClick={() => onExport('pdf')}
    className="w-full sm:w-auto h-12 sm:h-10 min-h-[44px] flex items-center justify-center gap-2 text-sm sm:text-xs font-medium touch-manipulation"
    aria-label="Exportar historial médico completo como PDF"
    role="button"
    tabIndex={0}
  >
    <Download className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
    <span className="truncate">Exportar PDF</span>
  </Button>
  <Button
    variant="outline"
    size="default"
    onClick={onPrint}
    className="w-full sm:w-auto h-12 sm:h-10 min-h-[44px] flex items-center justify-center gap-2 text-sm sm:text-xs font-medium touch-manipulation"
    aria-label="Imprimir historial médico completo"
    role="button"
    tabIndex={0}
  >
    <Printer className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
    <span className="truncate">Imprimir</span>
  </Button>
</div>
```

**Key Improvements:**
- `min-h-[44px]` ensures WCAG 2.1 AA compliance (44x44px touch targets)
- `w-full sm:w-auto` provides full-width buttons on mobile, auto-width on desktop
- `touch-manipulation` CSS property improves touch responsiveness
- Enhanced ARIA labels provide better screen reader context
- `flex-shrink-0` prevents icon distortion
- `truncate` prevents text overflow

### B. MedicalHistory.tsx - Similar Button Pattern

Apply the same mobile-first button pattern throughout MedicalHistory.tsx for consistency.

## 2. Mobile-First Table Design

### A. AllergyTableSimple.tsx - Responsive Table Implementation

**Current Issues:**
- Table requires horizontal scrolling on mobile (WCAG 1.4.10 violation)
- No mobile-specific data presentation
- Poor touch targets for sort buttons
- Missing keyboard navigation

**Recommended Implementation:**

```typescript
// Add mobile card view component within AllergyTableSimple.tsx
const MobileAllergyCard: React.FC<{ allergy: AlergiaType }> = ({ allergy }) => (
  <Card className="mb-4 shadow-sm border-border hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h3 className="font-semibold text-base leading-tight mb-1">
            {allergy.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {allergy.category}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={allergy.isAlergic ? "destructive" : "secondary"}
            className="text-xs font-medium min-h-[24px] flex items-center"
          >
            {allergy.isAlergic ? 'Alérgica' : 'No'}
          </Badge>
          {allergy.isAlergic && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium min-h-[24px] flex items-center",
                allergy.intensity === 'Alta' && "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
                allergy.intensity === 'Media' && "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
                allergy.intensity === 'Baja' && "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              )}
            >
              {allergy.intensity}
            </Badge>
          )}
        </div>
      </div>

      {allergy.KUA_Litro && (
        <div className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-md">
          <span className="text-muted-foreground font-medium">KUA/Litro:</span>
          <span className="font-mono font-semibold">{allergy.KUA_Litro.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">kU/L</span>
        </div>
      )}
    </CardContent>
  </Card>
);

// Update main render method to use responsive design
return (
  <div className="space-y-4">
    {/* Mobile View */}
    <div className="block lg:hidden">
      <div className="space-y-3">
        {filteredAndSortedAllergies.map((allergy) => (
          <MobileAllergyCard key={allergy.name} allergy={allergy} />
        ))}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {start + 1}-{Math.min(end, total)} de {total} alergias
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
              className="h-10 w-10 p-0"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-8 w-8 p-0 text-xs"
                    aria-label={`Ir a página ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="h-10 w-10 p-0"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>

    {/* Desktop View - Existing Table */}
    <div className="hidden lg:block">
      {/* Existing table implementation with enhanced accessibility */}
      <div className="rounded-lg border bg-background overflow-hidden dark:border-gray-700">
        <Table
          role="table"
          aria-label="Tabla de alergias con filtros aplicados"
          aria-rowcount={filteredAndSortedAllergies.length}
        >
          <TableHeader role="rowgroup">
            <TableRow role="row" className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead
                role="columnheader"
                className="w-[300px] dark:text-gray-200"
                scope="col"
                aria-sort={sortField === 'name' ? sortDirection : 'none'}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:bg-gray-700/50 touch-manipulation min-h-[44px] min-w-[44px] flex items-center"
                  aria-label={`Ordenar por nombre. Actualmente: ${
                    sortField === 'name'
                      ? sortDirection === 'asc'
                        ? 'orden ascendente'
                        : 'orden descendente'
                      : 'sin ordenar'
                  }. Activar para cambiar orden.`}
                >
                  <span>Nombre</span>
                  {sortField === 'name' && (
                    <span className="ml-1" aria-hidden="true">
                      {sortDirection === 'asc' ?
                        <ArrowUpIcon className="h-4 w-4" /> :
                        <ArrowDownIcon className="h-4 w-4" />
                      }
                    </span>
                  )}
                </Button>
              </TableHead>
              {/* ... other table headers with similar enhancements */}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup">
            {/* Existing table rows with enhanced accessibility */}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);
```

### B. Enhanced Table Navigation for Mobile

```typescript
// Add keyboard navigation hooks
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Keyboard shortcuts for table navigation
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'f':
          e.preventDefault();
          document.getElementById('table-search')?.focus();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPage(1);
          break;
        case 'End':
          e.preventDefault();
          setCurrentPage(totalPages);
          break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [currentPage, totalPages]);
```

## 3. Accessibility Enhancements

### A. Enhanced CSS for Focus Management

**File to modify:** `/src/index.css`

```css
/* Add these styles to index.css after the existing CSS variables */

@layer utilities {
  /* Enhanced focus styles for better accessibility */
  .focus-ring {
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .focus-ring {
      @apply focus-visible:ring-4 focus-visible:ring-offset-0;
    }
  }

  /* Touch-friendly targets */
  .touch-target {
    @apply min-h-[44px] min-w-[44px] touch-manipulation;
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .transition-motion {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* Mobile-specific touch optimizations */
@media (hover: none) and (pointer: coarse) {
  .touch-manipulation {
    touch-action: manipulation;
  }

  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Skip links for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

### B. Enhanced ARIA Implementation

```typescript
// Add comprehensive ARIA labels and announcements
const useTableAria = (totalItems: number, filteredCount: number) => {
  const [announcement, setAnnouncement] = useState('');

  const announceSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    const fieldNames = {
      name: 'nombre',
      category: 'categoría',
      intensity: 'intensidad',
      KUA_Litro: 'KUA por litro'
    };

    setAnnouncement(`Tabla ordenada por ${fieldNames[field as keyof typeof fieldNames]} en orden ${direction === 'asc' ? 'ascendente' : 'descendente'}`);
  }, []);

  const announceFilterChange = useCallback((count: number) => {
    setAnnouncement(`Mostrando ${count} de ${totalItems} alergias`);
  }, [totalItems]);

  return { announcement, announceSortChange, announceFilterChange };
};

// Add live region for announcements
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

## 4. Search vs Table View Separation

### A. Enhanced TableView.tsx

**File to modify:** `/src/TableView.tsx`

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Table2, Filter } from 'lucide-react';
import AllergyTableSimple from '@/components/medical/AllergyTableSimple';
import InputSearch from '@/components/InputSearch';
import MedicalErrorBoundary from '@/components/MedicalErrorBoundary';

type ViewMode = 'table' | 'search';

function TableView(): JSX.Element {
  const [activeView, setActiveView] = useState<ViewMode>('table');

  return (
    <MedicalErrorBoundary componentName="TableView" showEmergencyInfo={true}>
      <div className="space-y-6">
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>

        {/* View Mode Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Vista de Alergias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant={activeView === 'table' ? 'default' : 'outline'}
                  onClick={() => setActiveView('table')}
                  className="h-14 flex items-center justify-center gap-3 text-base font-medium touch-target focus-ring"
                  aria-pressed={activeView === 'table'}
                  aria-describedby="table-view-desc"
                >
                  <Table2 className="h-5 w-5" aria-hidden="true" />
                  <span>Tabla Completa</span>
                </Button>
                <Button
                  variant={activeView === 'search' ? 'default' : 'outline'}
                  onClick={() => setActiveView('search')}
                  className="h-14 flex items-center justify-center gap-3 text-base font-medium touch-target focus-ring"
                  aria-pressed={activeView === 'search'}
                  aria-describedby="search-view-desc"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                  <span>Buscar Alergias</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <p id="table-view-desc">
                  Ver todas las alergias en formato de tabla con opciones de filtrado y ordenación
                </p>
                <p id="search-view-desc">
                  Buscar alergias específicas por nombre o característica
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <main id="main-content">
          {activeView === 'table' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span>Usa los controles de filtrado para refinar los resultados</span>
              </div>
              <AllergyTableSimple />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Busca alergias por nombre, categoría o nivel de intensidad</span>
              </div>
              <InputSearch />
            </div>
          )}
        </main>
      </div>
    </MedicalErrorBoundary>
  );
}

export default TableView;
```

## 5. Testing and Validation Plan

### A. Mobile Testing Checklist

```typescript
// Mobile viewport testing breakpoints
const mobileBreakpoints = {
  small: '320px',   // iPhone SE
  medium: '375px',  // iPhone 12
  large: '414px',   // iPhone 12 Pro Max
  tablet: '768px'   // iPad Mini
};

// Touch target validation
const validateTouchTargets = () => {
  const buttons = document.querySelectorAll('button, [role="button"], a');
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(button);
    const minHeight = parseInt(computedStyle.minHeight) || rect.height;
    const minWidth = parseInt(computedStyle.minWidth) || rect.width;

    if (minHeight < 44 || minWidth < 44) {
      console.warn(`Touch target too small: ${button.textContent}`, {
        height: minHeight,
        width: minWidth,
        element: button
      });
    }
  });
};
```

### B. Accessibility Testing Scripts

```typescript
// Automated accessibility checks
const runAccessibilityChecks = () => {
  // Check for ARIA labels
  const interactiveElements = document.querySelectorAll('button, [role="button"], input, select, textarea');
  interactiveElements.forEach(element => {
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      console.warn('Missing ARIA label:', element);
    }
  });

  // Check color contrast
  // This would require a contrast checking library like 'axe-core'

  // Check keyboard navigation
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element, index) => {
    element.addEventListener('focus', () => {
      console.log(`Focus element ${index}:`, element);
    });
  });
};
```

## Implementation Priority and Timeline

### Phase 1: Critical Mobile Issues (Week 1)
1. **Button Touch Targets** - Update all buttons to meet 44x44px minimum
2. **Mobile Table Cards** - Implement card-based view for mobile
3. **Basic ARIA Labels** - Add screen reader support to all interactive elements
4. **Focus Styles** - Implement visible focus indicators

### Phase 2: Enhanced Accessibility (Week 2)
1. **Keyboard Navigation** - Add keyboard shortcuts and logical tab order
2. **Screen Reader Announcements** - Add live regions for dynamic content
3. **Color Contrast** - Verify and fix contrast ratios
4. **View Separation** - Implement distinct search and table modes

### Phase 3: Polish and Testing (Week 3)
1. **Reduced Motion** - Add animation preferences support
2. **High Contrast Mode** - Ensure compatibility with high contrast themes
3. **Comprehensive Testing** - Manual and automated accessibility testing
4. **Performance Optimization** - Ensure smooth performance on mobile devices

## Files to Create/Modify

### New Files
1. `/src/components/mobile/MobileAllergyCard.tsx` - Mobile-optimized allergy display
2. `/src/hooks/useTableAria.ts` - Accessibility management hook
3. `/src/utils/accessibility.ts` - Accessibility utility functions
4. `/src/types/accessibility.ts` - TypeScript types for accessibility

### Modified Files
1. `/src/components/medical/MedicalDashboard.tsx` - Mobile-responsive buttons
2. `/src/components/medical/MedicalHistory.tsx` - Mobile-responsive buttons
3. `/src/components/medical/AllergyTableSimple.tsx` - Responsive table design
4. `/src/TableView.tsx` - View mode separation
5. `/src/index.css` - Accessibility and mobile styles

## Validation Requirements

### Mobile Device Testing
- [ ] Test on actual iOS devices (iPhone SE, iPhone 12, iPhone 12 Pro Max)
- [ ] Test on actual Android devices (Samsung Galaxy S21, Google Pixel)
- [ ] Verify touch targets with finger testing
- [ ] Test with mobile screen readers (VoiceOver, TalkBack)

### Accessibility Testing
- [ ] Keyboard-only navigation test
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast validation (4.5:1 minimum for normal text)
- [ ] WCAG 2.1 AA compliance check with axe DevTools

### Performance Testing
- [ ] First Contentful Paint < 3 seconds on 3G
- [ ] Smooth scrolling performance on mobile
- [ ] Memory usage with large datasets
- [ ] Animation performance (60fps)

This implementation plan provides a comprehensive roadmap to address all identified mobile accessibility issues while maintaining the existing design system and ensuring WCAG 2.1 AA compliance.