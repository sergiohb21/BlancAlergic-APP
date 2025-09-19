# Materials Feature Implementation Plan

## Overview
Based on analysis of the existing clients module and available shadcn/ui components, this document provides detailed recommendations for implementing a materials feature with similar structure but enhanced functionality.

## Required New Components to Install

### 1. Select Component
```bash
npx shadcn@latest add select
```
- **Purpose**: Category and unit dropdown selectors
- **Location**: `src/modules/core/components/ui/select.tsx`
- **Usage**: Material categories (Raw Materials, Finished Goods, etc.) and units (kg, lbs, pcs, etc.)

### 2. Textarea Component
```bash
npx shadcn@latest add textarea
```
- **Purpose**: Material description field (longer text content)
- **Location**: `src/modules/core/components/ui/textarea.tsx`
- **Usage**: Multi-line description input for materials

## Form Field Component Recommendations

### 1. Name Field
- **Component**: `Input` (existing)
- **Type**: Text
- **Validation**: Required, min 2 characters, max 100 characters
- **Pattern**: Same as client name field

### 2. Description Field
- **Component**: `Textarea` (new)
- **Type**: Multi-line text
- **Validation**: Optional, max 500 characters
- **Features**: Character counter, placeholder text

### 3. Price Field
- **Component**: `Input` (existing)
- **Type**: Number with step="0.01"
- **Validation**: Required, positive number, max 2 decimal places
- **Features**: Currency formatting, min/max value validation

### 4. Unit Field
- **Component**: `Select` (new)
- **Options**: Predefined units (kg, g, lbs, oz, pcs, m, cm, mm, L, mL)
- **Validation**: Required, must match predefined options

### 5. Category Field
- **Component**: `Select` (new)
- **Options**: Predefined categories (Raw Materials, Finished Goods, Supplies, Tools, Equipment, Other)
- **Validation**: Required, must match predefined options

## Category Selector Implementation

### Option 1: Static Categories (Recommended for initial implementation)
```typescript
const MATERIAL_CATEGORIES = [
  { value: "raw_materials", label: "Raw Materials" },
  { value: "finished_goods", label: "Finished Goods" },
  { value: "supplies", label: "Supplies" },
  { value: "tools", label: "Tools" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" }
] as const;
```

### Option 2: Database-driven Categories (Future enhancement)
- Create separate categories table
- Add CRUD operations for category management
- Use TanStack Query for category data fetching

## Database Schema Recommendations

```typescript
// src/modules/db/entities/materials.ts
import { pgTable, serial, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdateFn(() => new Date())
});

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
```

## Form Validation Schema

```typescript
// src/modules/materials/schemas/material-schema.ts
import { z } from "zod";

export const materialSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than 1,000,000"),
  unit: z.enum(["kg", "g", "lbs", "oz", "pcs", "m", "cm", "mm", "L", "mL"], {
    errorMap: () => ({ message: "Please select a valid unit" })
  }),
  category: z.enum(["raw_materials", "finished_goods", "supplies", "tools", "equipment", "other"], {
    errorMap: () => ({ message: "Please select a valid category" })
  })
});

export type MaterialFormData = z.infer<typeof materialSchema>;
```

## UI Improvements for Materials Table

### 1. Enhanced Column Display
- **Price column**: Right-aligned with currency formatting ($1,234.56)
- **Category column**: Color-coded badges for visual categorization
- **Unit column**: Consistent display with abbreviations

### 2. Advanced Filtering
- **Price range filter**: Min/max price inputs
- **Category filter**: Multi-select dropdown
- **Unit filter**: Select dropdown for specific units
- **Name filter**: Existing text-based search

### 3. Visual Enhancements
- **Conditional styling**: Highlight expensive materials or low-stock items
- **Status indicators**: Visual badges for different categories
- **Responsive design**: Mobile-friendly table layout

### 4. Table Features
- **Export functionality**: CSV/Excel export capability
- **Bulk actions**: Select multiple materials for batch operations
- **Quick actions**: Inline edit/delete with confirmation dialogs

## File Structure Recommendations

```
src/modules/materials/
├── components/
│   ├── table-materials.tsx           # Main table component
│   ├── material-form-dialog.tsx      # Create/Edit form dialog
│   ├── delete-material-dialog.tsx    # Delete confirmation dialog
│   └── material-card.tsx             # Optional: Card view component
├── hooks/
│   ├── useMaterials.ts               # Data fetching hook
│   ├── useMaterialsContext.tsx       # State management context
│   └── useMaterialMutations.ts       # CRUD operations
├── schemas/
│   └── material-schema.ts           # Zod validation schemas
├── services/
│   └── material-services.ts         # Server actions
├── types/
│   └── material-types.ts            # TypeScript definitions
└── lib/
    └── material-constants.ts        # Categories, units, etc.
```

## Implementation Steps

### Phase 1: Core Components
1. Install required shadcn/ui components (select, textarea)
2. Create database schema for materials
3. Implement basic CRUD operations
4. Create materials table component
5. Add form validation schemas

### Phase 2: Enhanced Features
1. Implement advanced filtering
2. Add price formatting and validation
3. Create category and unit selectors
4. Add responsive design improvements

### Phase 3: Advanced Features
1. Add export functionality
2. Implement bulk operations
3. Add visual indicators and badges
4. Performance optimizations

## Best Practices

### 1. Code Organization
- Follow existing clients module structure
- Use consistent naming conventions
- Maintain separation of concerns

### 2. Performance
- Implement proper React.memo usage
- Use TanStack Query for efficient data fetching
- Add loading states and error boundaries

### 3. Accessibility
- Ensure all form fields have proper labels
- Add ARIA attributes for screen readers
- Maintain keyboard navigation support

### 4. Testing
- Add unit tests for form validation
- Test CRUD operations
- Verify responsive behavior

## Migration Considerations

### From Static to Dynamic Categories
1. Start with static category definitions
2. Create categories table when needed
3. Update form components to fetch from database
4. Add category management interface

### Future Enhancements
- Material inventory tracking
- Supplier management integration
- Price history tracking
- Material usage analytics