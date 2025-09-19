# Dark Mode UI Analysis Context Session

## Analysis Summary
The BlancAlergic-APP has been updated to use Tailwind CSS with shadcn/ui components, replacing the previous BeerCSS framework. While the theme system has been properly configured with CSS variables for light and dark modes, there are several contrast issues in dark mode that need to be addressed.

## Current Theme Configuration

### CSS Variables (src/index.css)
The application uses a well-structured theme system with proper light/dark mode variables:
- Light mode: High contrast with light backgrounds and dark text
- Dark mode: Dark backgrounds with light text
- Proper color definitions for primary, secondary, muted, accent, and destructive variants

### Theme Provider
- Uses a custom `ThemeProvider` component with localStorage persistence
- Supports system theme detection via `prefers-color-scheme`
- Smooth transitions between themes (300ms)

## Identified Dark Mode Issues

### 1. Emergency View - Hardcoded Colors
**File**: `src/EmergencyView.tsx`
- Line 82: `text-red-600` hardcoded color
- Line 94: `text-red-600` hardcoded color
- Line 130: `text-blue-600` hardcoded color
- Lines 131, 145, 151: Various hardcoded text colors without dark mode variants

### 2. InputSearch Component - Icon Colors
**File**: `src/components/InputSearch.tsx`
- Line 26: `text-red-600` hardcoded
- Line 27: `text-yellow-600` hardcoded
- Line 28: `text-green-600` hardcoded
- Line 169: `text-green-800` hardcoded
- Line 172: `text-green-600` hardcoded

### 3. Badge Component Outline Variant
**File**: `src/components/ui/badge.tsx`
- Line 17: `outline` variant only uses `text-foreground` without sufficient contrast
- No background color for outline variant, making it hard to read on dark backgrounds

### 4. Potential Table Component Issues
While not visible in the current code, table components may need review for:
- Border colors in dark mode
- Hover states
- Text contrast

## Root Cause Analysis

1. **Legacy Code**: The application was originally built with BeerCSS and some hardcoded colors remain from that implementation
2. **Component Migration**: Some components weren't fully updated to use the new theme system
3. **Missing Dark Mode Classes**: Many text colors don't have `dark:` variants specified

## Accessibility Impact

The hardcoded colors create poor contrast ratios in dark mode, failing WCAG 2.1 AA standards:
- Red text (#dc2626) on dark backgrounds has insufficient contrast
- Green text (#16a34a) may be too light on dark backgrounds
- Blue text (#2563eb) needs adjustment for better visibility

## Next Steps

1. Replace all hardcoded colors with theme-aware alternatives
2. Add proper dark mode variants to text colors
3. Update the Badge component's outline variant
4. Test contrast ratios using accessibility tools
5. Ensure all interactive elements have proper hover/focus states in both themes