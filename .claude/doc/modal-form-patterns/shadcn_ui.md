# Modal Form Patterns with React Hook Form & shadcn/ui

## Analysis of Current Issues

### Critical Bugs Identified

1. **Edit Modal Data Loading Issue**
   - **Problem**: `ClientFormDialog` uses static `defaultValues` in `useForm` that don't update when `client` prop changes
   - **Location**: `src/modules/clients/components/client-form-dialog.tsx` lines 27-37
   - **Impact**: When editing different clients, the form shows stale data from the first client edited

2. **Modal Closing Issue**
   - **Problem**: Mutation success handlers don't call `closeModals()` after successful operations
   - **Location**: `src/modules/clients/hooks/useClientMutations.ts` lines 11-14, 23-26
   - **Impact**: Modals remain open after successful create/update operations

## Implementation Plan

### 1. Fix ClientFormDialog Component

**File**: `src/modules/clients/components/client-form-dialog.tsx`

#### Issues to Fix:
- Static `defaultValues` in `useForm`
- Missing `useEffect` for form synchronization
- Improper form reset handling

#### Proposed Changes:

```typescript
export function ClientFormDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSubmit, 
  isLoading = false 
}: ClientFormDialogProps) {
  // Compute default values dynamically
  const getDefaultValues = (client?: Client | null): ClientFormData => ({
    email: client?.email || "",
    name: client?.name || "",
    lastName: client?.lastName || "",
    phone: client?.phone || "",
    address: client?.address || "",
    dni: client?.dni || "",
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: getDefaultValues(client),
  });

  // Sync form when client prop changes
  useEffect(() => {
    form.reset(getDefaultValues(client));
  }, [client, form]);

  const handleSubmit = (data: ClientFormData) => {
    onSubmit(data);
    // Don't reset form here - let the parent handle modal closing
  };

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(getDefaultValues(null));
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Rest of component remains the same */}
    </Dialog>
  );
}
```

### 2. Update Mutation Hooks with Success Callbacks

**File**: `src/modules/clients/hooks/useClientMutations.ts`

#### Issues to Fix:
- Missing success callbacks for modal closing
- Need to support optional success handlers

#### Proposed Changes:

```typescript
export function useClientMutations() {
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: addClient,
    onSuccess: (_, __, context?: { onSuccess?: () => void }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created successfully");
      context?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message || "Unknown error"}`);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientFormData> }) => 
      updateClient(id, data),
    onSuccess: (_, __, context?: { onSuccess?: () => void }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client updated successfully");
      context?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message || "Unknown error"}`);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: (_, __, context?: { onSuccess?: () => void }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted successfully");
      context?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message || "Unknown error"}`);
    },
  });

  return {
    createClient,
    updateClient: updateClientMutation,
    deleteClient: deleteClientMutation,
  };
}
```

### 3. Update Main Page with Modal Closing Logic

**File**: `src/app/(auth)/(protected)/clients/page.tsx`

#### Issues to Fix:
- Missing success callbacks in mutation calls
- Need proper modal closing after successful operations

#### Proposed Changes:

```typescript
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

  const { createClient, updateClient, deleteClient } = useClientMutations();

  const handleCreateClient = (data: ClientFormData) => {
    createClient.mutate(data, {
      onSuccess: () => {
        closeModals();
      }
    });
  };

  const handleEditClient = (data: ClientFormData) => {
    if (selectedClient) {
      updateClient.mutate({ id: selectedClient.id, data }, {
        onSuccess: () => {
          closeModals();
        }
      });
    }
  };

  const handleDeleteClient = (id: number) => {
    deleteClient.mutate(id, {
      onSuccess: () => {
        closeModals();
      }
    });
  };

  // Rest of component remains the same
}
```

## shadcn/ui Best Practices for Modal Forms

### 1. Component Structure

```typescript
// Recommended pattern for modal forms
export function EntityFormDialog({ entity, onSubmit, ...props }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(entity),
  });

  useEffect(() => {
    if (entity) {
      form.reset(getDefaultValues(entity));
    }
  }, [entity, form]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entity ? 'Edit' : 'Create'} Entity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Form State Management

**Key Principles:**
- Use `useEffect` with `form.reset()` for dynamic default values
- Reset form when modal closes
- Handle loading states properly
- Provide proper error feedback

### 3. Mutation Patterns

**Best Practices:**
- Include success callbacks in mutation options
- Handle both async and sync success scenarios
- Provide consistent error handling
- Use toast notifications for user feedback

### 4. Accessibility Considerations

**shadcn/ui Dialog Features:**
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### 5. Loading State Management

```typescript
// Example of proper loading state handling
<Button type="submit" disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    entity ? 'Update' : 'Create'
  )}
</Button>
```

## Implementation Checklist

### Phase 1: Core Fixes
- [ ] Fix `ClientFormDialog` form state management
- [ ] Add `useEffect` for form synchronization
- [ ] Update mutation hooks with success callbacks
- [ ] Update main page with modal closing logic

### Phase 2: Testing & Validation
- [ ] Test edit modal with different clients
- [ ] Test modal closing after successful operations
- [ ] Test error scenarios
- [ ] Verify form validation works correctly

### Phase 3: Code Quality
- [ ] Add proper TypeScript types
- [ ] Ensure consistent error handling
- [ ] Add loading states
- [ ] Verify accessibility compliance

## Additional Recommendations

### 1. Form Validation Enhancement
Consider adding real-time validation and better error messages for user experience.

### 2. Loading State Optimization
Add loading spinners and disable buttons during async operations.

### 3. Error Boundary Implementation
Add error boundaries to catch and handle form submission errors gracefully.

### 4. Responsive Design Considerations
Ensure modal forms work well on mobile devices with proper sizing and scrolling.

### 5. Performance Optimization
Consider using `React.memo` for form components if performance becomes an issue.

## Files to Modify

1. `src/modules/clients/components/client-form-dialog.tsx`
2. `src/modules/clients/hooks/useClientMutations.ts`
3. `src/app/(auth)/(protected)/clients/page.tsx`

## Testing Strategy

1. **Unit Tests**: Test form state management and validation
2. **Integration Tests**: Test modal flow with mutations
3. **E2E Tests**: Test complete user journey from edit to save
4. **Accessibility Tests**: Verify keyboard navigation and screen reader support

This implementation plan addresses the critical bugs while following shadcn/ui best practices for modal form patterns.