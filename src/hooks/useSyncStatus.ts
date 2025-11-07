import { useState, useEffect } from 'react';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  status: 'pending' | 'completed' | 'error';
  timestamp: Date;
  errorMessage?: string;
}

interface UseSyncStatusReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: SyncOperation[];
  lastSyncTime: Date | null;
  syncErrors: SyncOperation[];
  clearErrors: () => void;
  retrySync: () => void;
}

export const useSyncStatus = (): UseSyncStatusReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations] = useState<SyncOperation[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<SyncOperation[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Aquí podríamos implementar reintentos automáticos
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearErrors = () => {
    setSyncErrors([]);
  };

  const retrySync = () => {
    // Implementar lógica de reintento de sincronización
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }, 2000);
  };

  return {
    isOnline,
    isSyncing,
    pendingOperations,
    lastSyncTime,
    syncErrors,
    clearErrors,
    retrySync
  };
};