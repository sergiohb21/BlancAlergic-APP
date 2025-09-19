# Materials Feature Architecture Recommendations

Based on the analysis of the existing clients module, here are detailed architectural recommendations for implementing the materials feature with CRUD functionality.

## 1. Database Schema Design

### File: `src/modules/db/entities/materials.ts`
```typescript
import { pgTable, serial, text, numeric, varchar, timestamp } from "drizzle-orm/pg-core";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdateFn(() => new Date())
});

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
```

### Key Design Decisions:
- **id**: Auto-incrementing serial primary key (consistent with clients)
- **name**: VARCHAR(255) with NOT NULL constraint (similar to client name)
- **description**: TEXT for longer descriptions
- **price**: NUMERIC(10,2) for precise decimal values (essential for pricing)
- **unit**: VARCHAR(50) for units (e.g., "kg", "m", "pcs", "liters")
- **category**: VARCHAR(100) for categorization
- **Timestamps**: Consistent with clients pattern (created_at, updated_at)

## 2. Server Action Patterns

### File: `src/modules/materials/services/index.ts`
```typescript
"use server";

import { db } from "@/src/modules/db";
import { NewMaterial, materials, Material } from "@/src/modules/db/entities/materials";
import { DEFAULT_QUERY_PER_PAGE } from "@/src/modules/core/lib/constants";
import { eq, or, ilike, and } from "drizzle-orm";

export async function getAllMaterials({
  page = 1,
  perPage = DEFAULT_QUERY_PER_PAGE,
}: {
  page: number;
  perPage: number;
}) {
  const offset = (page - 1) * perPage;

  const totalRowsQuery = db.$count(materials);
  const rowsQuery = db.select().from(materials).limit(perPage).offset(offset);

  const [totalRows, rows] = await Promise.all([totalRowsQuery, rowsQuery]);

  return {
    page,
    perPage,
    totalRows,
    totalPages: Math.ceil(totalRows / perPage),
    data: rows,
  };
}

export async function getMaterialById(id: number): Promise<Material | null> {
  const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
  return result[0] || null;
}

export const addMaterial = async (material: NewMaterial) => {
  const result = await db.insert(materials).values(material).returning();
  return result[0];
};

export async function updateMaterial(id: number, material: Partial<NewMaterial>): Promise<Material | null> {
  const result = await db
    .update(materials)
    .set({ ...material, updatedAt: new Date() })
    .where(eq(materials.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteMaterial(id: number): Promise<boolean> {
  const result = await db.delete(materials).where(eq(materials.id, id)).returning();
  return result.length > 0;
}

export async function searchMaterials({
  query = "",
  category = "",
  page = 1,
  perPage = DEFAULT_QUERY_PER_PAGE,
}: {
  query: string;
  category?: string;
  page?: number;
  perPage?: number;
}) {
  const offset = (page - 1) * perPage;
  
  let whereClause = undefined;
  if (query.trim() || category.trim()) {
    const conditions = [];
    
    if (query.trim()) {
      const searchQuery = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(materials.name, searchQuery),
          ilike(materials.description, searchQuery)
        )
      );
    }
    
    if (category.trim()) {
      conditions.push(eq(materials.category, category));
    }
    
    whereClause = and(...conditions);
  }

  const totalRowsQuery = db.$count(materials, whereClause);
  const rowsQuery = db.select().from(materials).where(whereClause).limit(perPage).offset(offset);

  const [totalRows, rows] = await Promise.all([totalRowsQuery, rowsQuery]);

  return {
    page,
    perPage,
    totalRows,
    totalPages: Math.ceil(totalRows / perPage),
    data: rows,
  };
}

export async function getMaterialsByCategory(category: string) {
  return db.select().from(materials).where(eq(materials.category, category));
}
```

### Server Action Best Practices:
1. **"use server" directive**: Explicitly marks server actions
2. **Type safety**: Uses Drizzle inferred types for parameters and return values
3. **Consistent error handling**: Follows established patterns
4. **Pagination**: Reuses DEFAULT_QUERY_PER_PAGE constant
5. **Search functionality**: Enhanced with category filtering
6. **Atomic operations**: Each action performs a single database operation

## 3. Hook Architecture

### File: `src/modules/materials/hooks/useMaterials.ts`
```typescript
import { useQuery } from "@tanstack/react-query";
import { getAllMaterials } from "../services";
import { DEFAULT_QUERY_PER_PAGE } from "@/src/modules/core/lib/constants";
import type { MaterialsResponse } from "../types";

export function useMaterials(
  page = 1,
  perPage = DEFAULT_QUERY_PER_PAGE
) {
  return useQuery<MaterialsResponse>({
    queryKey: ["materials", page, perPage],
    queryFn: () => getAllMaterials({ page, perPage }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMaterialsSearch(
  query: string,
  category: string = "",
  page = 1,
  perPage = DEFAULT_QUERY_PER_PAGE
) {
  return useQuery<MaterialsResponse>({
    queryKey: ["materials", "search", query, category, page, perPage],
    queryFn: () => searchMaterials({ query, category, page, perPage }),
    enabled: query.trim().length > 0 || category.trim().length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

export function useMaterialsByCategory(category: string) {
  return useQuery<Material[]>({
    queryKey: ["materials", "category", category],
    queryFn: () => getMaterialsByCategory(category),
    enabled: category.trim().length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000, // 10 minutes for category data
  });
}
```

### File: `src/modules/materials/hooks/useMaterialMutations.ts`
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMaterial, updateMaterial, deleteMaterial } from "../services";
import { toast } from "sonner";
import type { MaterialFormData } from "../schemas/material-schema";

interface UseMaterialMutationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMaterialMutations(options: UseMaterialMutationsOptions = {}) {
  const queryClient = useQueryClient();

  const createMaterial = useMutation({
    mutationFn: addMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material created successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create material: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaterialFormData> }) => 
      updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material updated successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update material: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material deleted successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete material: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  return {
    createMaterial,
    updateMaterial: updateMaterialMutation,
    deleteMaterial: deleteMaterialMutation,
  };
}
```

### File: `src/modules/materials/hooks/use-materials-context.tsx`
```typescript
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Material } from "@/src/modules/db/entities/materials";

interface MaterialsContextType {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedMaterial: Material | null;
  openCreateModal: () => void;
  openEditModal: (material: Material) => void;
  openDeleteDialog: (material: Material) => void;
  closeModals: () => void;
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
  
  const openEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };
  
  const openDeleteDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };
  
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedMaterial(null);
  };

  return (
    <MaterialsContext.Provider value={{
      isCreateModalOpen,
      isEditModalOpen,
      isDeleteDialogOpen,
      selectedMaterial,
      openCreateModal,
      openEditModal,
      openDeleteDialog,
      closeModals
    }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterialsContext() {
  const context = useContext(MaterialsContext);
  if (context === undefined) {
    throw new Error("useMaterialsContext must be used within a MaterialsProvider");
  }
  return context;
}
```

## 4. Type Definitions and Zod Schema Structure

### File: `src/modules/materials/schemas/material-schema.ts`
```typescript
import { z } from "zod";

// Predefined categories for validation
const MATERIAL_CATEGORIES = [
  "Raw Materials",
  "Finished Goods",
  "Packaging",
  "Tools",
  "Equipment",
  "Chemicals",
  "Electrical",
  "Plumbing",
  "Hardware",
  "Other"
] as const;

// Predefined units for validation
const MATERIAL_UNITS = [
  "kg", "g", "lb", "oz",      // Weight
  "m", "cm", "mm", "ft", "in", // Length
  "L", "mL", "gal", "fl oz",   // Volume
  "pcs", "unit", "set", "pair", // Count
  "m²", "ft²", "cm²",          // Area
  "m³", "ft³", "cm³",          // Volume (cubic)
  "roll", "box", "bag", "case" // Packaging
] as const;

export const materialSchema = z.object({
  name: z.string()
    .min(1, "Material name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  price: z.number()
    .min(0, "Price must be greater than or equal to 0")
    .max(9999999.99, "Price must be less than 10,000,000")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      "Price can have at most 2 decimal places"
    ),
  unit: z.enum(MATERIAL_UNITS, {
    errorMap: () => ({ message: "Please select a valid unit" })
  }),
  category: z.enum(MATERIAL_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" })
  })
});

export const updateMaterialSchema = materialSchema.partial().extend({
  id: z.number().positive("Invalid material ID"),
});

export type MaterialFormData = z.infer<typeof materialSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
export type MaterialCategory = typeof MATERIAL_CATEGORIES[number];
export type MaterialUnit = typeof MATERIAL_UNITS[number];
```

### File: `src/modules/materials/types/index.ts`
```typescript
import { Material, NewMaterial } from "@/src/modules/db/entities/materials";
import { 
  MaterialFormData, 
  UpdateMaterialFormData,
  MaterialCategory,
  MaterialUnit
} from "../schemas/material-schema";

export type { 
  Material, 
  NewMaterial, 
  MaterialFormData, 
  UpdateMaterialFormData,
  MaterialCategory,
  MaterialUnit
};

export interface MaterialsResponse {
  page: number;
  perPage: number;
  totalRows: number;
  totalPages: number;
  data: Material[];
}

export interface MaterialSearchParams {
  query?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface MaterialMutationParams {
  id?: number;
  data: MaterialFormData;
}

export interface MaterialFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
}
```

## 5. Database Migration Approach

### Migration Strategy:
1. **Create new migration**: `npm run db:generate`
2. **Apply migration**: `npm run db:migrate`
3. **Update index file**: Add materials to the entities index

### File: `src/modules/db/entities/index.ts`
```typescript
export * from './clients';
export * from './materials'; // Add this line
```

### Migration Considerations:
- **Non-breaking**: Materials is a new table, won't affect existing data
- **Indexes**: Consider adding indexes on frequently queried fields:
  - `name` (for search)
  - `category` (for filtering)
  - `price` (for range queries)
- **Foreign keys**: No immediate foreign key requirements
- **Constraints**: All NOT NULL constraints are enforced

## 6. Error Handling and Validation Patterns

### Client-Side Validation:
- **Zod schema validation** with comprehensive error messages
- **Form-level validation** using React Hook Form
- **Real-time validation** with proper error state management

### Server-Side Validation:
- **Type safety** through Drizzle ORM
- **Database constraint validation** at the database level
- **Error boundary** for unexpected errors

### Error Handling Patterns:
```typescript
// In server actions
try {
  // Database operation
} catch (error) {
  console.error('Database error:', error);
  throw new Error('Operation failed');
}

// In hooks
onError: (error: Error) => {
  toast.error(`Operation failed: ${error.message}`);
  // Additional error logging or handling
}
```

## 7. Performance Considerations

### Data Fetching Optimization:
1. **React Query caching**: 5-minute cache for main data, 2-minute for search
2. **Pagination**: Prevents loading large datasets
3. **Placeholder data**: Smooth transitions between page loads
4. **Query deduplication**: Prevents duplicate requests

### Database Optimization:
1. **Indexes**: Add indexes for frequently queried fields
2. **Connection pooling**: Already configured in existing setup
3. **Query optimization**: Use `Promise.all` for parallel queries

### Client-Side Performance:
1. **Component memoization**: Where appropriate
2. **Virtual scrolling**: For large tables (consider future enhancement)
3. **Debounced search**: For real-time search functionality

## 8. Additional Architectural Considerations

### File Structure:
```
src/modules/materials/
├── components/
│   ├── table-materials.tsx
│   ├── material-form-dialog.tsx
│   ├── delete-material-dialog.tsx
│   └── material-search.tsx
├── hooks/
│   ├── useMaterials.ts
│   ├── useMaterialMutations.ts
│   └── use-materials-context.tsx
├── schemas/
│   └── material-schema.ts
├── services/
│   └── index.ts
└── types/
    └── index.ts
```

### UI Component Requirements:
- **Select component**: For category and unit dropdowns
- **Textarea component**: For material descriptions
- **Number input**: For price entry with decimal support
- **Enhanced search**: With category filtering

### Integration Points:
- **Database**: Update entities index and run migrations
- **Navigation**: Add materials route to sidebar
- **Styling**: Follow existing Tailwind patterns
- **Authentication**: Uses existing Clerk middleware

## 9. Implementation Priority

1. **High Priority**:
   - Database schema and migrations
   - Basic CRUD server actions
   - Core hooks and types
   - Basic table component

2. **Medium Priority**:
   - Advanced search with category filtering
   - Form validation improvements
   - Error handling optimization

3. **Low Priority**:
   - Performance optimizations
   - Advanced filtering options
   - Export functionality

This architecture follows the established patterns from the clients module while incorporating materials-specific requirements and enhancements.