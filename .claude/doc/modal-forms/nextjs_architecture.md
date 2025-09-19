# Next.js Modal Forms State Management Architecture

## Executive Summary

This document provides a comprehensive architectural analysis and implementation plan for modal forms state management in Next.js 15 applications using React Hook Form, React Query, and Context API. The solution addresses critical bugs in edit modal data loading and modal persistence after form submission.

## Current Architecture Issues

### Critical Bugs Identified

1. **Edit Modal Data Loading Problem**
   - **Issue**: Form uses static `defaultValues` that don't update when `client` prop changes
   - **Root Cause**: React Hook Form initializes defaultValues only once during component creation
   - **Impact**: Users see stale data when editing different clients sequentially

2. **Modal Persistence After Form Submission**
   - **Issue**: Modals remain open after successful form submission
   - **Root Cause**: Mutation success handlers don't trigger modal state updates
   - **Impact**: Poor user experience, manual modal closure required

### Architectural Analysis

**Current Pattern:**
```
Context API (Modal State) → React Hook Form (Form State) → React Query (Data Operations)
```

**Identified Problems:**
- **State Synchronization**: No mechanism to sync form state with prop changes
- **Event Coordination**: Mutations and modal state operate independently
- **Performance**: Unnecessary re-renders due to context usage patterns
- **Maintainability**: Mixed concerns between UI state and business logic

## Recommended Architecture

### 1. Enhanced React Hook Form Integration

**Key Pattern**: Dynamic form state management with useEffect synchronization

```typescript
// /src/modules/clients/components/client-form-dialog.tsx
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useCallback } from "react";
import { clientSchema, type ClientFormData } from "../schemas/client-schema";
import type { Client } from "@/src/modules/db/entities/clients";

export function ClientFormDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSubmit, 
  isLoading = false 
}: ClientFormDialogProps) {
  // Initialize form with proper defaults
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: getDefaultValues(client),
    mode: "onChange", // Better validation timing
  });

  // Dynamic form synchronization
  useEffect(() => {
    const newValues = getDefaultValues(client);
    form.reset(newValues);
  }, [client, form]);

  // Memoized submit handler
  const handleSubmit = useCallback((data: ClientFormData) => {
    onSubmit(data);
    // Don't reset form here - let parent control the flow
  }, [onSubmit]);

  // Utility function for consistent default values
  const getDefaultValues = useCallback((client?: Client | null): ClientFormData => {
    return {
      email: client?.email || "",
      name: client?.name || "",
      lastName: client?.lastName || "",
      phone: client?.phone || "",
      address: client?.address || "",
      dni: client?.dni || "",
    };
  }, []);

  // Rest of component implementation
}
```

### 2. Enhanced Mutation Hooks with Callback Support

**Key Pattern**: Mutation hooks that accept success callbacks for UI coordination

```typescript
// /src/modules/clients/hooks/useClientMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addClient, updateClient, deleteClient } from "../services";
import { toast } from "sonner";
import type { ClientFormData } from "../schemas/client-schema";

interface UseClientMutationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useClientMutations(options: UseClientMutationsOptions = {}) {
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: addClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.setQueryData(["clients", data.id], data);
      toast.success("Client created successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientFormData> }) => 
      updateClient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.setQueryData(["clients", data.id], data);
      toast.success("Client updated successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message || "Unknown error"}`);
      options.onError?.(error);
    },
  });

  return {
    createClient,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
  };
}
```

### 3. Enhanced Context API with Computed Values

**Key Pattern**: Rich context with computed properties and granular control

```typescript
// /src/modules/clients/hooks/use-clients-context.tsx
"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import type { Client } from "@/src/modules/db/entities/clients";

interface ClientsContextType {
  // State
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedClient: Client | null;
  
  // Actions
  openCreateModal: () => void;
  openEditModal: (client: Client) => void;
  openDeleteDialog: (client: Client) => void;
  closeModals: () => void;
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDeleteDialog: () => void;
  
  // Computed
  isAnyModalOpen: boolean;
  activeModal: null | 'create' | 'edit' | 'delete';
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Computed values
  const isAnyModalOpen = useMemo(() => 
    isCreateModalOpen || isEditModalOpen || isDeleteDialogOpen, 
    [isCreateModalOpen, isEditModalOpen, isDeleteDialogOpen]
  );

  const activeModal = useMemo(() => {
    if (isCreateModalOpen) return 'create';
    if (isEditModalOpen) return 'edit';
    if (isDeleteDialogOpen) return 'delete';
    return null;
  }, [isCreateModalOpen, isEditModalOpen, isDeleteDialogOpen]);

  // Granular modal controls
  const openCreateModal = () => {
    setSelectedClient(null);
    setIsCreateModalOpen(true);
  };
  
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };
  
  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };
  
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const closeCreateModal = () => setIsCreateModalOpen(false);
  const closeEditModal = () => setIsEditModalOpen(false);
  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);

  const value = useMemo(() => ({
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    selectedClient,
    openCreateModal,
    openEditModal,
    openDeleteDialog,
    closeModals,
    closeCreateModal,
    closeEditModal,
    closeDeleteDialog,
    isAnyModalOpen,
    activeModal,
  }), [
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    selectedClient,
    isAnyModalOpen,
    activeModal,
  ]);

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClientsContext() {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error("useClientsContext must be used within a ClientsProvider");
  }
  return context;
}
```

### 4. Optimized Page Component Integration

**Key Pattern**: Coordinated mutation handling with modal state

```typescript
// /src/app/(auth)/(protected)/clients/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useClientsContext } from "@/src/modules/clients/hooks/use-clients-context";
import { useClientMutations } from "@/src/modules/clients/hooks/useClientMutations";
import { ClientFormDialog } from "@/src/modules/clients/components/client-form-dialog";
import type { ClientFormData } from "@/src/modules/clients/schemas/client-schema";
import type { Client } from "@/src/modules/db/entities/clients";

function ClientsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    isCreateModalOpen,
    isEditModalOpen,
    selectedClient,
    openCreateModal,
    openEditModal,
    closeModals
  } = useClientsContext();

  // Initialize mutations with success callback
  const { createClient, updateClient, deleteClient } = useClientMutations({
    onSuccess: closeModals,
  });

  // Memoized handlers for better performance
  const handleCreateClient = useCallback((data: ClientFormData) => {
    createClient.mutate(data);
  }, [createClient]);

  const handleEditClient = useCallback((data: ClientFormData) => {
    if (selectedClient) {
      updateClient.mutate({ id: selectedClient.id, data });
    }
  }, [updateClient, selectedClient]);

  const handleDeleteClient = useCallback((id: number) => {
    deleteClient.mutate(id);
  }, [deleteClient]);

  const handleEdit = useCallback((client: Client) => {
    openEditModal(client);
  }, [openEditModal]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page content */}
      
      <ClientFormDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => !open && closeModals()}
        onSubmit={handleCreateClient}
        isLoading={createClient.isPending}
      />

      <ClientFormDialog
        open={isEditModalOpen}
        onOpenChange={(open) => !open && closeModals()}
        client={selectedClient}
        onSubmit={handleEditClient}
        isLoading={updateClient.isPending}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <ClientsProvider>
      <ClientsPageContent />
    </ClientsProvider>
  );
}
```

### 5. Performance Optimizations

**Component Memoization:**

```typescript
// Memoize form dialog to prevent unnecessary re-renders
const ClientFormDialog = React.memo(function ClientFormDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSubmit, 
  isLoading = false 
}: ClientFormDialogProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.open === nextProps.open &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.client?.id === nextProps.client?.id &&
    prevProps.onSubmit === nextProps.onSubmit
  );
});
```

**Optimized Context Usage:**

```typescript
// Split context if needed for performance
const ClientsModalContext = createContext<ClientsModalContextType | undefined>(undefined);
const ClientsDataContext = createContext<ClientsDataContextType | undefined>(undefined);

// Use separate contexts for different concerns
```

## Implementation Steps

### Phase 1: Fix Critical Bugs (High Priority)

1. **Update ClientFormDialog Component**
   - Add useEffect for form.reset() when client prop changes
   - Implement proper form synchronization
   - Add form validation mode "onChange"

2. **Enhance Mutation Hooks**
   - Add onSuccess callback support
   - Implement proper cache updates
   - Add comprehensive error handling

3. **Update Page Component**
   - Pass closeModals to mutation onSuccess
   - Implement memoized handlers
   - Test both create and edit workflows

### Phase 2: Architecture Improvements (Medium Priority)

1. **Enhance Context API**
   - Add computed properties
   - Implement granular modal controls
   - Add proper TypeScript typing

2. **Optimize Service Layer**
   - Add comprehensive error handling
   - Implement proper response typing
   - Add logging for debugging

### Phase 3: Performance Optimizations (Low Priority)

1. **Component Optimization**
   - Add React.memo to frequently rendered components
   - Implement custom comparison functions
   - Add useCallback for event handlers

2. **Advanced Patterns**
   - Consider Zustand for complex state management
   - Implement React Query for client state
   - Add performance monitoring

## Testing Strategy

### Unit Tests
- Form state synchronization
- Mutation callback handling
- Context API behavior

### Integration Tests
- Modal workflow end-to-end
- Form submission and closure
- Error handling scenarios

### Performance Tests
- Re-render optimization
- Memory usage
- Large dataset handling

## Key Architectural Principles

1. **Single Source of Truth**: Context API manages modal state centrally
2. **Controlled Components**: React Hook Form manages form state predictably
3. **Side Effect Management**: useEffect handles form synchronization properly
4. **Event Coordination**: Mutations trigger UI updates through callbacks
5. **Performance Optimization**: Memoization and selective re-rendering
6. **Type Safety**: Comprehensive TypeScript throughout
7. **Error Boundaries**: Graceful error handling at all levels
8. **Maintainability**: Clear separation of concerns

## Files to Modify

1. `/src/modules/clients/components/client-form-dialog.tsx`
   - Add useEffect for form synchronization
   - Implement memoization
   - Add proper form validation

2. `/src/modules/clients/hooks/useClientMutations.ts`
   - Add onSuccess callback support
   - Enhance error handling
   - Improve cache updates

3. `/src/modules/clients/hooks/use-clients-context.tsx`
   - Add computed properties
   - Implement granular controls
   - Optimize with useMemo

4. `/src/app/(auth)/(protected)/clients/page.tsx`
   - Update mutation usage
   - Add memoized handlers
   - Test integration

5. `/src/modules/clients/services/index.ts`
   - Enhance error handling
   - Add proper response typing
   - Implement logging

## Conclusion

This architecture provides a robust solution for modal forms state management in Next.js 15 applications. The implementation addresses critical bugs while establishing patterns for maintainable, performant, and scalable modal form workflows. The solution leverages React Hook Form's strengths while integrating seamlessly with React Query and Context API for comprehensive state management.