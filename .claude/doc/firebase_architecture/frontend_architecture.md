# Plan de Arquitectura Firebase - BlancAlergic-APP

## Resumen Ejecutivo

Este documento detalla el plan completo para mejorar la arquitectura de Firebase en la aplicación médica BlancAlergic-APP. El análisis identifica áreas críticas de seguridad, rendimiento y sincronización que requieren atención inmediata.

## Estado Actual vs. Estado Deseado

### Configuración Firebase
- **Actual**: Configuración básica con variables de entorno
- **Deseado**: Configuración segura con validación y monitoreo

### Seguridad de Datos
- **Actual**: Reglas básicas de aislamiento por usuario
- **Deseado**: Seguridad multicapa con encriptación y auditoría

### Sincronización
- **Actual**: Solo modo online con indicadores básicos
- **Deseado**: Sincronización offline completa con resolución de conflictos

## Plan de Implementación Detallado

### Fase 1: Seguridad Crítica (2-3 semanas)

#### 1.1 Mejorar Reglas de Seguridad de Firestore

**Archivo a modificar**: `/firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    function isValidPhoneNumber(phone) {
      return phone.matches('^[+]?[1-9]\\d{1,14}$');
    }

    // Users collection with validation
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      // Subcollections with enhanced validation
      match /allergies/{allergyId} {
        allow read, write: if isOwner(userId)
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && request.resource.data.category is string
          && request.resource.data.intensity in ['Baja', 'Media', 'Alta']
          && request.resource.data.isActive is bool;
      }

      match /medications/{medicationId} {
        allow read, write: if isOwner(userId)
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && request.resource.data.dosage is string
          && request.resource.data.active is bool;
      }

      match /medicalRecords/{recordId} {
        allow read, write: if isOwner(userId)
          && request.resource.data.type is string
          && request.resource.data.title is string
          && request.resource.data.title.size() > 0
          && request.resource.data.date is timestamp;
      }
    }

    // Public allergies (read-only for authenticated users)
    match /publicAllergies/{allergyId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### 1.2 Crear Índices Compuestos

**Archivo a crear**: `/firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "allergies",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "name",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "medications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "name",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "medicalRecords",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

#### 1.3 Mejorar Autenticación

**Archivo a modificar**: `/src/firebase/auth.ts`

```typescript
// Añadir después de la línea 21
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online'
});

// Configurar tiempo de sesión
auth.settings.appVerificationDisabledForTesting = false;

// Función para verificar email
export const sendEmailVerification = async (user: AuthUser): Promise<void> => {
  try {
    await sendEmailVerificationInternal(user);
  } catch (error) {
    console.error('Error enviando verificación de email:', error);
    throw new Error('No se pudo enviar el email de verificación');
  }
};

// Función para verificar si el email está verificado
export const isEmailVerified = (user: AuthUser): boolean => {
  return user.emailVerified || false;
};

// Modificar createOrUpdateMedicalProfile para requerir email verificado
export const createOrUpdateMedicalProfile = async (user: AuthUser): Promise<void> => {
  if (!user) return;

  // Exigir email verificado para datos médicos
  if (!user.emailVerified) {
    throw new Error('Se requiere verificación de email para acceder a datos médicos');
  }

  // ... resto del código existente
};
```

#### 1.4 Implementar Timeout de Sesión

**Archivo a crear**: `/src/hooks/useSessionTimeout.ts`

```typescript
import { useEffect, useCallback } from 'react';
import { signOutUser } from '../firebase/auth';
import { useAuth } from './useAuth';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutos antes

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout automático:', error);
    }
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);

      // Mostrar advertencia 5 minutos antes
      warningTimeoutId = setTimeout(() => {
        console.warn('Tu sesión expirará en 5 minutos');
      }, WARNING_TIMEOUT);

      // Cerrar sesión después de 30 minutos
      timeoutId = setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT);
    };

    // Eventos para resetear el timeout
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [user, handleLogout]);
};
```

### Fase 2: Sincronización Offline (3-4 semanas)

#### 2.1 Activar Persistencia Offline

**Archivo a modificar**: `/src/firebase/config.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ... configuración existente ...

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Activar persistencia offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiples pestañas abiertas, persistencia no habilitada');
  } else if (err.code === 'unimplemented') {
    console.warn('El navegador no soporta persistencia');
  }
});

// Configuración adicional
auth.languageCode = 'es';

export { auth, db, storage };
export default app;
```

#### 2.2 Implementar Cola de Operaciones Pendientes

**Archivo a crear**: `/src/services/syncQueue.ts`

```typescript
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class SyncQueue {
  private operations: PendingOperation[] = [];
  private isProcessing = false;
  private readonly STORAGE_KEY = 'firebase_sync_queue';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.operations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error cargando cola de sincronización:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.operations));
    } catch (error) {
      console.error('Error guardando cola de sincronización:', error);
    }
  }

  addOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    const pendingOp: PendingOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.operations.push(pendingOp);
    this.saveToStorage();
    this.processQueue();
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;
    const operationsToProcess = [...this.operations];
    this.operations = [];
    this.saveToStorage();

    for (const operation of operationsToProcess) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Error ejecutando operación:', operation, error);

        if (operation.retryCount < operation.maxRetries) {
          operation.retryCount++;
          this.operations.push(operation);
        } else {
          // Notificar al usuario del error persistente
          this.notifyPersistentError(operation, error);
        }
      }
    }

    this.saveToStorage();
    this.isProcessing = false;
  }

  private async executeOperation(operation: PendingOperation): Promise<void> {
    // Implementar ejecución real de la operación
    // Esto depende de las funciones de Firestore que ya existen
    switch (operation.type) {
      case 'create':
        // Llamar a función create correspondiente
        break;
      case 'update':
        // Llamar a función update correspondiente
        break;
      case 'delete':
        // Llamar a función delete correspondiente
        break;
    }
  }

  private notifyPersistentError(operation: PendingOperation, error: any): void {
    // Implementar notificación de error persistente
    console.error('Operación fallida permanentemente:', operation, error);
  }

  getPendingCount(): number {
    return this.operations.length;
  }

  clearQueue(): void {
    this.operations = [];
    this.saveToStorage();
  }
}

export const syncQueue = new SyncQueue();
```

#### 2.3 Mejorar Hook de Sincronización

**Archivo a modificar**: `/src/hooks/useSyncStatus.ts`

```typescript
import { useState, useEffect } from 'react';
import { syncQueue } from '../services/syncQueue';

interface UseSyncStatusReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTime: Date | null;
  syncErrors: any[];
  clearErrors: () => void;
  retrySync: () => void;
  forceSync: () => Promise<void>;
}

export const useSyncStatus = (): UseSyncStatusReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Procesar cola cuando volvemos online
      syncQueue.processQueue();
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

  const retrySync = async () => {
    setIsSyncing(true);
    try {
      await syncQueue.processQueue();
      setLastSyncTime(new Date());
    } catch (error) {
      setSyncErrors(prev => [...prev, error]);
    } finally {
      setIsSyncing(false);
    }
  };

  const forceSync = async () => {
    setIsSyncing(true);
    try {
      await syncQueue.processQueue();
      setLastSyncTime(new Date());
    } catch (error) {
      setSyncErrors(prev => [...prev, error]);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingOperations: syncQueue.getPendingCount(),
    lastSyncTime,
    syncErrors,
    clearErrors,
    retrySync,
    forceSync
  };
};
```

### Fase 3: Rendimiento y Optimización (2-3 semanas)

#### 3.1 Implementar Paginación

**Archivo a crear**: `/src/hooks/usePaginatedQuery.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Query, QueryDocumentSnapshot, DocumentData, query, startAfter, limit, getDocs } from 'firebase/firestore';

interface UsePaginatedQueryOptions {
  pageSize: number;
  initialQuery: Query<DocumentData>;
}

export const usePaginatedQuery = <T = DocumentData>({
  pageSize,
  initialQuery
}: UsePaginatedQueryOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      let queryToUse = initialQuery;

      if (!reset && lastDoc) {
        queryToUse = query(initialQuery, startAfter(lastDoc));
      }

      queryToUse = query(queryToUse, limit(pageSize));

      const snapshot = await getDocs(queryToUse);
      const newDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      if (reset) {
        setData(newDocs);
      } else {
        setData(prev => [...prev, ...newDocs]);
      }

      setHasMore(snapshot.docs.length === pageSize);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [initialQuery, lastDoc, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(false);
    }
  }, [loading, hasMore, fetchPage]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchPage(true);
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(true);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
```

#### 3.2 Optimizar Operaciones Batch

**Archivo a crear**: `/src/services/batchOperations.ts`

```typescript
import { writeBatch, doc, DocumentReference } from 'firebase/firestore';
import { db } from '../firebase/config';

interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  ref: DocumentReference;
  data?: any;
}

class BatchManager {
  private queue: BatchOperation[] = [];
  private readonly MAX_BATCH_SIZE = 500;

  addOperation(operation: BatchOperation): void {
    this.queue.push(operation);

    if (this.queue.length >= this.MAX_BATCH_SIZE) {
      this.executeBatch();
    }
  }

  async executeBatch(): Promise<void> {
    if (this.queue.length === 0) return;

    const operations = [...this.queue];
    this.queue = [];

    const batches: BatchOperation[][] = [];
    for (let i = 0; i < operations.length; i += this.MAX_BATCH_SIZE) {
      batches.push(operations.slice(i, i + this.MAX_BATCH_SIZE));
    }

    for (const batchOps of batches) {
      const batch = writeBatch(db);

      for (const operation of batchOps) {
        switch (operation.type) {
          case 'set':
            batch.set(operation.ref, operation.data);
            break;
          case 'update':
            batch.update(operation.ref, operation.data);
            break;
          case 'delete':
            batch.delete(operation.ref);
            break;
        }
      }

      try {
        await batch.commit();
      } catch (error) {
        console.error('Error en batch operation:', error);
        // Re-queue failed operations
        this.queue.unshift(...batchOps);
        throw error;
      }
    }
  }

  async flush(): Promise<void> {
    await this.executeBatch();
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

export const batchManager = new BatchManager();
```

### Fase 4: Monitoreo y Resiliencia (2-3 semanas)

#### 4.1 Error Tracking Centralizado

**Archivo a crear**: `/src/services/errorTracking.ts`

```typescript
interface ErrorReport {
  error: Error;
  context: Record<string, any>;
  timestamp: number;
  userId?: string;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private readonly MAX_ERRORS = 100;
  private readonly STORAGE_KEY = 'error_reports';

  trackError(error: Error, context: Record<string, any> = {}): void {
    const report: ErrorReport = {
      error,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.push(report);

    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift();
    }

    this.saveToStorage();
    console.error('Error tracked:', report);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (error) {
      console.error('Error guardando reportes de error:', error);
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async sendErrors(): Promise<void> {
    // Implementar envío de errores a servicio externo
    // Por ahora solo log en consola
    console.log('Enviando errores:', this.errors);
  }
}

export const errorTracker = new ErrorTracker();
```

#### 4.2 Retry Automático con Backoff

**Archivo a crear**: `/src/utils/retry.ts`

```typescript
interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      console.warn(`Intento ${attempt} fallido, reintentando en ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### Fase 5: Características Avanzadas (3-4 semanas)

#### 5.1 Encriptación de Campos Sensibles

**Archivo a crear**: `/src/utils/encryption.ts`

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key';

export function encryptSensitiveData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptSensitiveData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function encryptSensitiveFields(obj: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
  const encrypted = { ...obj };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptSensitiveData(encrypted[field]);
    }
  }

  return encrypted;
}

export function decryptSensitiveFields(obj: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
  const decrypted = { ...obj };

  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decryptSensitiveData(decrypted[field]);
      } catch (error) {
        console.warn(`Error desencriptando campo ${field}:`, error);
      }
    }
  }

  return decrypted;
}
```

## Archivos a Modificar o Crear

### Modificaciones Principales:
1. `/firestore.rules` - Reglas de seguridad mejoradas
2. `/firebase.json` - Configuración actualizada
3. `/src/firebase/config.ts` - Persistencia offline
4. `/src/firebase/auth.ts` - Mejoras de autenticación
5. `/src/contexts/AuthContext.tsx` - Timeout de sesión
6. `/src/hooks/useSyncStatus.ts` - Cola de sincronización
7. `/src/hooks/useMedicalData.ts` - Paginación y caché

### Nuevos Archivos:
1. `/firestore.indexes.json` - Índices compuestos
2. `/src/hooks/useSessionTimeout.ts` - Timeout de sesión
3. `/src/services/syncQueue.ts` - Cola de operaciones
4. `/src/hooks/usePaginatedQuery.ts` - Paginación
5. `/src/services/batchOperations.ts` - Operaciones batch
6. `/src/services/errorTracking.ts` - Error tracking
7. `/src/utils/retry.ts` - Retry automático
8. `/src/utils/encryption.ts` - Encriptación

## Métricas de Implementación

### Métricas Técnicas:
- **Tiempo de implementación**: 12-17 semanas total
- **Cobertura de seguridad**: 95%+ después de Fase 1
- **Disponibilidad offline**: 100% funcionalidad básica
- **Performance**: <3s tiempo de carga, <5s sincronización

### Métricas de Negocio:
- **Reducción de errores**: 90% menos errores de sincronización
- **Mejora UX**: Sincronización transparente para usuario
- **Cumplimiento**: Estándares HIPAA/GDPR para datos médicos
- **Escalabilidad**: Soporte para 10x más usuarios sin degradación

## Consideraciones de Despliegue

### Pipeline de Despliegue:
1. **Development**: Implementación progresiva por fases
2. **Staging**: Pruebas completas de seguridad y rendimiento
3. **Production**: Despliegue con feature flags

### Rollback Plan:
- Copias de seguridad automáticas antes de cada fase
- Feature flags para desactivar funcionalidades problemáticas
- Monitoreo continuo durante primeras 48 horas

## Conclusiones y Próximos Pasos

1. **Priorizar Fase 1** por su criticidad en seguridad
2. **Implementar monitoreo** desde el inicio para medir impacto
3. **Documentar procesos** de recuperación ante desastres
4. **Establecer SLAs** para disponibilidad y recuperación
5. **Planificar capacitación** del equipo en nuevas funcionalidades

Este plan transforma la aplicación actual en una solución médica robusta, segura y escalable lista para producción enterprise.