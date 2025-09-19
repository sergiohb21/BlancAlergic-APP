# Clients CRUD UI Implementation Plan

## Overview
This document provides a comprehensive implementation plan for creating a complete CRUD UI for clients using shadcn/ui components. The implementation will leverage the existing Next.js 15 App Router, TanStack Query, and Drizzle ORM setup.

## Current Analysis
- **Database Schema**: Clients table with id, email, name, lastName, phone, address, dni, createdAt, updatedAt
- **Existing Table**: Basic TanStack Table implementation with pagination and filtering
- **Services**: Basic CRUD operations (getAllClients, addClient) need to be extended
- **UI Setup**: shadcn/ui v4 with New York style configured

## Component Architecture

### 1. Required shadcn/ui Components

#### Form Components
- **`@/src/modules/core/components/ui/form.tsx`** - React Hook Form integration with shadcn
- **`@/src/modules/core/components/ui/input.tsx`** - Input fields with validation states
- **`@/src/modules/core/components/ui/label.tsx`** - Form labels with error states
- **`@/src/modules/core/components/ui/button.tsx`** - Action buttons with variants

#### Modal/Dialog Components  
- **`@/src/modules/core/components/ui/dialog.tsx`** - Modal for create/edit forms
- **`@/src/modules/core/components/ui/alert-dialog.tsx`** - Delete confirmation dialog
- **`@/src/modules/core/components/ui/tooltip.tsx`** - Action button tooltips

#### Layout & Display Components
- **`@/src/modules/core/components/ui/card.tsx`** - Card wrappers for forms
- **`@/src/modules/core/components/ui/badge.tsx`** - Status indicators
- **`@/src/modules/core/components/ui/separator.tsx`** - Visual separators
- **`@/src/modules/core/components/ui/sonner.tsx`** - Toast notifications

### 2. File Structure

```
src/modules/clients/
├── components/
│   ├── table-clients.tsx (enhanced)
│   ├── client-form-dialog.tsx
│   ├── delete-client-dialog.tsx
│   ├── client-actions.tsx
│   └── client-search.tsx
├── hooks/
│   ├── useClients.ts
│   ├── useClientMutations.ts
│   └── useClientForm.ts
├── schemas/
│   └── client-schema.ts (new)
├── services/
│   └── index.ts (extended)
└── types/
    └── index.ts (enhanced)
```

## Implementation Details

### 1. Form Validation Schema

```typescript
// src/modules/clients/schemas/client-schema.ts
import { z } from "zod";

export const clientSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  dni: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
```

### 2. Modal Form Component

```typescript
// src/modules/clients/components/client-form-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/modules/core/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/modules/core/components/ui/form";
import { Input } from "@/src/modules/core/components/ui/input";
import { Button } from "@/src/modules/core/components/ui/button";
import { clientSchema, type ClientFormData } from "../schemas/client-schema";
import type { Client } from "@/src/modules/db/entities/clients";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
}

export function ClientFormDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSubmit, 
  isLoading = false 
}: ClientFormDialogProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      email: client?.email || "",
      name: client?.name || "",
      lastName: client?.lastName || "",
      phone: client?.phone || "",
      address: client?.address || "",
      dni: client?.dni || "",
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {client ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter DNI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : client ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Delete Confirmation Dialog

```typescript
// src/modules/clients/components/delete-client-dialog.tsx
"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/modules/core/components/ui/alert-dialog";
import { Button } from "@/src/modules/core/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteClientDialogProps {
  clientName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteClientDialog({ 
  clientName, 
  onConfirm, 
  isLoading = false 
}: DeleteClientDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{clientName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4. Enhanced Table with Actions

```typescript
// Enhanced table-clients.tsx modifications
// Add actions column to existing table
const columns = [
  // ... existing columns
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
        <DeleteClientDialog
          clientName={`${row.original.name} ${row.original.lastName}`}
          onConfirm={() => onDelete(row.original.id)}
          isLoading={isDeleting}
        />
      </div>
    ),
  }),
];
```

### 5. Search and Filter Component

```typescript
// src/modules/clients/components/client-search.tsx
"use client";

import { useState } from "react";
import { Input } from "@/src/modules/core/components/ui/input";
import { Button } from "@/src/modules/core/components/ui/button";
import { Search, X } from "lucide-react";

interface ClientSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function ClientSearch({ 
  onSearch, 
  onClear, 
  placeholder = "Search clients..." 
}: ClientSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 6. Enhanced Services Layer

```typescript
// Extended src/modules/clients/services/index.ts
export async function getClientById(id: number) {
  const client = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return client[0];
}

export async function updateClient(id: number, client: Partial<NewClient>) {
  return await db.update(clients).set(client).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  return await db.delete(clients).where(eq(clients.id, id));
}

export async function searchClients(query: string, { page = 1, perPage = DEFAULT_QUERY_PER_PAGE }) {
  const offset = (page - 1) * perPage;
  const searchQuery = `%${query}%`;
  
  const whereClause = or(
    ilike(clients.name, searchQuery),
    ilike(clients.lastName, searchQuery),
    ilike(clients.email, searchQuery),
    ilike(clients.dni, searchQuery)
  );

  const totalRowsQuery = db.$count(clients, whereClause);
  const rowsQuery = db.select().from(clients).where(whereClause).limit(perPage).offset(offset);

  const [totalRows, rows] = await Promise.all([totalRowsQuery, rowsQuery]);

  return {
    page,
    perPage,
    totalRows,
    totalPages: Math.ceil(totalRows / perPage),
    data: rows,
  };
}
```

### 7. Custom Hooks for State Management

```typescript
// src/modules/clients/hooks/useClients.ts
import { useQuery } from "@tanstack/react-query";
import { getAllClients, searchClients } from "../services";
import { DEFAULT_QUERY_PER_PAGE } from "@/src/modules/core/lib/constants";

export function useClients(searchQuery = "", page = 1, perPage = DEFAULT_QUERY_PER_PAGE) {
  return useQuery({
    queryKey: ["clients", searchQuery, page, perPage],
    queryFn: () => 
      searchQuery 
        ? searchClients(searchQuery, { page, perPage })
        : getAllClients({ page, perPage }),
    keepPreviousData: true,
  });
}

// src/modules/clients/hooks/useClientMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addClient, updateClient, deleteClient } from "../services";
import { toast } from "sonner";

export function useClientMutations() {
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      toast.success("Client created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create client");
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update client");
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      toast.success("Client deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete client");
    },
  });

  return {
    createClient,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
  };
}
```

### 8. Main Clients Page Integration

```typescript
// Enhanced src/app/(auth)/(protected)/clients/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/modules/core/components/ui/button";
import { Plus } from "lucide-react";
import { ClientFormDialog } from "@/src/modules/clients/components/client-form-dialog";
import TableClients from "@/src/modules/clients/components/table-clients";
import { ClientSearch } from "@/src/modules/clients/components/client-search";
import { useClientMutations } from "@/src/modules/clients/hooks/useClientMutations";

export default function ClientsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { createClient, updateClient, deleteClient } = useClientMutations();

  const handleCreateClient = (data: ClientFormData) => {
    createClient.mutate(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditClient = (data: ClientFormData) => {
    if (editingClient) {
      updateClient.mutate({ id: editingClient.id, data });
      setEditingClient(null);
    }
  };

  const handleDeleteClient = (id: number) => {
    deleteClient.mutate(id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client database
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <ClientSearch 
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      </div>

      <TableClients 
        searchQuery={searchQuery}
        onEdit={setEditingClient}
        onDelete={handleDeleteClient}
        isDeleting={deleteClient.isLoading}
      />

      <ClientFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateClient}
        isLoading={createClient.isLoading}
      />

      <ClientFormDialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        client={editingClient}
        onSubmit={handleEditClient}
        isLoading={updateClient.isLoading}
      />
    </div>
  );
}
```

## Best Practices and Implementation Notes

### 1. Form Validation
- Use Zod for schema validation with React Hook Form
- Provide real-time validation feedback
- Show validation errors clearly with FormMessage components
- Implement proper TypeScript types for form data

### 2. Modal/Dialog Patterns
- Use Dialog for forms, AlertDialog for destructive actions
- Implement proper loading states during async operations
- Close modals automatically on successful operations
- Use consistent button placement and styling

### 3. Table Enhancements
- Add action buttons with tooltips for better UX
- Implement proper loading skeletons during data fetching
- Add sorting capabilities to all columns
- Use consistent spacing and styling

### 4. Search and Filter
- Implement debounced search for better performance
- Show clear button when search is active
- Search across multiple fields (name, email, dni, etc.)
- Maintain pagination during search

### 5. Error Handling and Loading States
- Use toast notifications for user feedback
- Show loading states on all async operations
- Disable buttons during operations to prevent duplicate submissions
- Implement proper error boundaries

### 6. Responsive Design
- Use responsive grid layouts for forms
- Implement mobile-friendly action buttons
- Use proper spacing and typography scales
- Test across different screen sizes

### 7. Performance Considerations
- Use React Query caching effectively
- Implement proper debouncing for search
- Use React.memo for expensive components
- Optimize re-renders with proper key management

### 8. Accessibility
- Ensure all form fields have proper labels
- Implement keyboard navigation support
- Use ARIA attributes where appropriate
- Provide clear feedback for all interactions

## Required Dependencies

Make sure these dependencies are installed:
```bash
npm install @hookform/resolvers zod react-hook-form
npm install lucide-react
npm install sonner
```

## Next Steps

1. Add the required shadcn/ui components using the CLI
2. Implement the file structure as outlined
3. Extend the services layer with missing CRUD operations
4. Implement the custom hooks for state management
5. Create the form validation schema
6. Build the modal and dialog components
7. Enhance the existing table component
8. Integrate everything in the main clients page
9. Test all CRUD operations and user interactions
10. Ensure responsive design and accessibility compliance

This implementation plan provides a comprehensive foundation for a production-ready clients CRUD interface using shadcn/ui components and modern React patterns.