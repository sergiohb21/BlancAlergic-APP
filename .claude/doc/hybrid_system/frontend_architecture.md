# Sistema Híbrido BlancAlergic-APP - Plan de Arquitectura Frontend

## Resumen Ejecutivo

Plan de implementación técnica para transformar BlancAlergic-APP en un sistema híbrido con áreas públicas gratuitas y áreas premium protegidas por contraseña, manteniendo la arquitectura PWA existente y añadiendo capacidades de almacenamiento seguro de datos médicos.

## Arquitectura Técnica Propuesta

### Stack Tecnológico Principal

**Stack Existente (sin cambios):**
- React 18.3.1 + TypeScript 5.2.2
- Vite 5.3.1 con PWA plugin
- React Router DOM 6.24.0 (basename: "/BlancAlergic-APP/")
- shadcn/ui + Radix UI + Tailwind CSS
- Deploy en GitHub Pages (estático)

**Nuevas Dependencias:**
```json
{
  "dependencies": {
    "@libsodium/wrappers": "^0.7.13",
    "@types/libsodium-wrappers": "^0.7.10",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "qrcode.react": "^3.1.0",
    "react-hot-toast": "^2.4.1",
    "zxcvbn": "^4.4.2",
    "@types/zxcvbn": "^4.4.4"
  },
  "devDependencies": {
    "vite-plugin-node-polyfills": "^0.22.0"
  }
}
```

### 1. Estructura de Archivos y Carpetas

```
src/
├── components/
│   ├── auth/                          # 🆕 Autenticación
│   │   ├── AuthDialog.tsx             # Modal de login/registro
│   │   ├── ProtectedRoute.tsx         # Wrapper de rutas protegidas
│   │   ├── AuthStatus.tsx             # Indicador de estado premium
│   │   ├── PasswordSetup.tsx          # Configuración inicial de contraseña
│   │   └── SessionWarning.tsx         # Alerta de timeout de sesión
│   ├── premium/                       # 🆕 Componentes premium
│   │   ├── PremiumNavigation.tsx      # Navegación con ítems premium
│   │   ├── MedicalDataForm.tsx        # Formularios médicos
│   │   ├── EncryptionIndicator.tsx    # Indicador de encriptación
│   │   ├── BackupRestore.tsx          # UI de backup/restore
│   │   └── PremiumDashboard.tsx       # Dashboard premium
│   ├── medical/ (existente, extendido)
│   │   ├── MedicalHistory.tsx         # Historial médico completo
│   │   ├── Medications.tsx            # 🆕 Gestión de medicamentos
│   │   ├── MedicalVisits.tsx          # 🆕 Visitas médicas
│   │   └── MedicalReports.tsx         # 🆕 Reportes médicos
│   └── layout/ (modificado)
│       ├── Header.tsx                 # Extendido con premium
│       ├── MobileNavigation.tsx       # Extendido con premium
│       └── Footer.tsx                 # Sin cambios
├── contexts/ (modificado)
│   ├── AppContext.tsx                 # Extendido con auth state
│   └── AuthContext.tsx                # 🆕 Contexto de autenticación
├── services/                          # 🆕 Servicios de backend
│   ├── SecureStorage.ts               # IndexedDB + encriptación
│   ├── AuthService.ts                 # Lógica de autenticación
│   ├── CryptoService.ts               # Servicios de encriptación
│   ├── BackupService.ts               # GitHub API integration
│   └── SessionManager.ts              # Gestión de sesiones
├── hooks/                             # 🆕 Custom hooks
│   ├── useAuth.ts                     # Hook de autenticación
│   ├── useSecureStorage.ts            # Hook de almacenamiento seguro
│   ├── useEncryption.ts               # Hook de encriptación
│   ├── useSessionTimeout.ts           # Hook de timeout de sesión
│   └── usePremiumFeatures.ts          # Hook de features premium
├── types/ (extendido)
│   ├── auth.ts                        # 🆕 Tipos de autenticación
│   ├── medical.ts (existente)
│   ├── encryption.ts                  # 🆕 Tipos de encriptación
│   └── backup.ts                      # 🆕 Tipos de backup
├── utils/ (extendido)
│   ├── crypto.ts                      # 🆕 Utilidades criptográficas
│   ├── validation.ts                  # 🆕 Validación de contraseñas
│   └── github-api.ts                  # 🆕 Integración GitHub API
├── pages/ (nuevo)
│   ├── MedicalHistoryPage.tsx         # 🆕 Página de historial médico
│   ├── MedicationsPage.tsx            # 🆕 Página de medicamentos
│   ├── MedicalVisitsPage.tsx          # 🆕 Página de visitas médicas
│   └── BackupRestorePage.tsx          # 🆕 Página de backup/restore
├── workers/ (nuevo)
│   └── crypto.worker.ts               # 🆕 Web Worker para encriptación
└── db/ (nuevo)
    └── schema.ts                      # 🆕 Schema de IndexedDB
```

### 2. Configuración de Rutas Protegidas

**Modificación: `src/main.tsx`**
```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MedicalHistoryPage } from '@/pages/MedicalHistoryPage';
import { MedicationsPage } from '@/pages/MedicationsPage';
import { MedicalVisitsPage } from '@/pages/MedicalVisitsPage';
import { BackupRestorePage } from '@/pages/BackupRestorePage';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="blancalergic-theme">
      <AppProvider>
        <AuthProvider>
          <AppInitializer>
            <Router basename="/BlancAlergic-APP/">
              <Layout>
                <Routes>
                  {/* Rutas Públicas (existentes) */}
                  <Route path="/" element={<Outlet />}/>
                  <Route path="/buscarAlergias" element={<InputSearch />} />
                  <Route path="/emergencias" element={<EmergencyView />} />
                  <Route path="/tablaAlergias" element={<TableView />} />

                  {/* Rutas Premium Protegidas (nuevas) */}
                  <Route path="/historial-medico" element={
                    <ProtectedRoute>
                      <MedicalHistoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/medicamentos" element={
                    <ProtectedRoute>
                      <MedicationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/visitas-medicas" element={
                    <ProtectedRoute>
                      <MedicalVisitsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/backup-restore" element={
                    <ProtectedRoute>
                      <BackupRestorePage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Layout>
            </Router>
          </AppInitializer>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

### 3. Sistema de Autenticación con Context API

**Nuevo: `src/contexts/AuthContext.tsx`**
```typescript
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/AuthService';
import { SessionManager } from '@/services/SessionManager';
import { AuthState, AuthAction } from '@/types/auth';

interface AuthContextType {
  state: AuthState;
  actions: {
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    setupPassword: (password: string) => Promise<boolean>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    checkAuth: () => Promise<boolean>;
    unlockSession: () => void;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const authService = new AuthService();
  const sessionManager = new SessionManager();

  const actions = {
    login: async (password: string): Promise<boolean> => {
      dispatch({ type: 'AUTH_START' });
      try {
        const success = await authService.login(password);
        if (success) {
          dispatch({ type: 'AUTH_SUCCESS' });
          sessionManager.startSession();
          return true;
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Contraseña incorrecta' });
          return false;
        }
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Error de autenticación' });
        return false;
      }
    },

    logout: () => {
      authService.logout();
      sessionManager.clearSession();
      dispatch({ type: 'AUTH_LOGOUT' });
    },

    setupPassword: async (password: string): Promise<boolean> => {
      dispatch({ type: 'SETUP_START' });
      try {
        const success = await authService.setupPassword(password);
        if (success) {
          dispatch({ type: 'SETUP_SUCCESS' });
          return true;
        } else {
          dispatch({ type: 'SETUP_FAILURE', payload: 'Error configurando contraseña' });
          return false;
        }
      } catch (error) {
        dispatch({ type: 'SETUP_FAILURE', payload: 'Error configurando contraseña' });
        return false;
      }
    },

    checkAuth: async (): Promise<boolean> => {
      const isAuthenticated = await authService.checkAuth();
      if (isAuthenticated) {
        dispatch({ type: 'AUTH_SUCCESS' });
        sessionManager.startSession();
      }
      return isAuthenticated;
    },

    // ... otras acciones
  };

  useEffect(() => {
    actions.checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

### 4. Integración con IndexedDB + Dexie.js

**Nuevo: `src/services/SecureStorage.ts`**
```typescript
import Dexie, { Table } from 'dexie';
import { EncryptedMedicalRecord, AppConfig, ExportHistory } from '@/types/encryption';
import { CryptoService } from './CryptoService';

export class SecureMedicalStorage extends Dexie {
  medicalRecords!: Table<EncryptedMedicalRecord>;
  appConfig!: Table<AppConfig>;
  exportHistory!: Table<ExportHistory>;
  accessLog!: Table<any>;

  constructor() {
    super('BlancAlergicSecureDB');

    this.version(1).stores({
      medicalRecords: '++id, patientId, recordType, encryptedData, createdAt, updatedAt',
      appConfig: '++id, key, value, updatedAt',
      exportHistory: '++id, exportType, timestamp, fileSize, status',
      accessLog: '++id, timestamp, action, success, ipAddress'
    });
  }

  async initializeDatabase(masterPassword: string): Promise<boolean> {
    try {
      const cryptoService = new CryptoService();
      const success = await cryptoService.initializeWithPassword(masterPassword);

      if (success) {
        // Verificar integridad de datos existentes
        await this.verifyDataIntegrity();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      return false;
    }
  }

  async saveMedicalRecord(record: any): Promise<string> {
    const cryptoService = new CryptoService();
    const encryptedData = await cryptoService.encrypt(JSON.stringify(record));

    const encryptedRecord: EncryptedMedicalRecord = {
      patientId: 'blanca-primary', // ID del paciente
      recordType: record.type || 'general',
      encryptedData: encryptedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await this.medicalRecords.add(encryptedRecord);

    // Registrar en log de acceso
    await this.logAccess('CREATE_MEDICAL_RECORD', true);

    return id.toString();
  }

  async getMedicalRecords(type?: string): Promise<any[]> {
    const cryptoService = new CryptoService();
    let records;

    if (type) {
      records = await this.medicalRecords.where('recordType').equals(type).toArray();
    } else {
      records = await this.medicalRecords.toArray();
    }

    const decryptedRecords = await Promise.all(
      records.map(async (record) => {
        try {
          const decryptedData = await cryptoService.decrypt(record.encryptedData);
          return {
            ...JSON.parse(decryptedData),
            id: record.id,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          };
        } catch (error) {
          console.error('Error desencriptando registro:', error);
          return null;
        }
      })
    );

    return decryptedRecords.filter(record => record !== null);
  }

  private async verifyDataIntegrity(): Promise<void> {
    // Implementar verificación de integridad de datos
  }

  private async logAccess(action: string, success: boolean): Promise<void> {
    await this.accessLog.add({
      timestamp: new Date(),
      action,
      success,
      ipAddress: 'localhost' // En producción, obtener IP real
    });
  }
}
```

### 5. Sistema de Encriptación

**Nuevo: `src/services/CryptoService.ts`**
```typescript
import _sodium from 'libsodium-wrappers';
import { PasswordStrength } from '@/types/encryption';

export class CryptoService {
  private sodium: any;
  private masterKey: Uint8Array | null = null;
  private isInitialized = false;

  async initializeWithPassword(password: string): Promise<boolean> {
    try {
      await _sodium.ready;
      this.sodium = _sodium;

      // Generar salt aleatorio
      const salt = this.sodium.randombytes_buf(this.sodium.crypto_pwhash_SALTBYTES);

      // Derivar clave maestra usando PBKDF2
      this.masterKey = this.sodium.crypto_pwhash(
        32, // 256 bits
        password,
        salt,
        100000, // 100,000 iteraciones
        this.sodium.crypto_pwhash_ALG_ARGON2ID13
      );

      this.isInitialized = true;

      // Guardar salt para uso futuro
      await this.saveSalt(salt);

      return true;
    } catch (error) {
      console.error('Error inicializando criptografía:', error);
      return false;
    }
  }

  async encrypt(data: string): Promise<string> {
    if (!this.isInitialized || !this.masterKey) {
      throw new Error('CryptoService no inicializado');
    }

    const nonce = this.sodium.randombytes_buf(this.sodium.crypto_aead_aes256gcm_NPUBBYTES);
    const encrypted = this.sodium.crypto_aead_aes256gcm_encrypt(
      data,
      null, // additional data
      null, // no secret nonce
      nonce,
      this.masterKey
    );

    // Combinar nonce + encrypted data
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return this.sodium.to_base64(combined, this.sodium.base64_variants.URLSAFE_NO_PADDING);
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.isInitialized || !this.masterKey) {
      throw new Error('CryptoService no inicializado');
    }

    const combined = this.sodium.from_base64(
      encryptedData,
      this.sodium.base64_variants.URLSAFE_NO_PADDING
    );

    const nonce = combined.slice(0, this.sodium.crypto_aead_aes256gcm_NPUBBYTES);
    const encrypted = combined.slice(this.sodium.crypto_aead_aes256gcm_NPUBBYTES);

    const decrypted = this.sodium.crypto_aead_aes256gcm_decrypt(
      null, // nonce
      encrypted,
      null, // additional data
      nonce,
      this.masterKey
    );

    return new TextDecoder().decode(decrypted);
  }

  analyzePasswordStrength(password: string): PasswordStrength {
    // Implementar análisis de fortaleza de contraseña
    const length = password.length;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    if (length >= 12) score += 2;
    else if (length >= 8) score += 1;
    if (hasUpperCase) score += 1;
    if (hasLowerCase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecialChar) score += 1;

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

    return {
      score,
      strength,
      feedback: this.getPasswordFeedback(score, {
        length,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      })
    };
  }

  private async saveSalt(salt: Uint8Array): Promise<void> {
    // Guardar salt en IndexedDB (no encriptado)
    const storage = new SecureMedicalStorage();
    await storage.appConfig.put({
      key: 'master_salt',
      value: this.sodium.to_base64(salt),
      updatedAt: new Date()
    });
  }

  private getPasswordFeedback(score: number, checks: any): string[] {
    const feedback: string[] = [];

    if (checks.length < 12) feedback.push('Usa al menos 12 caracteres');
    if (!checks.hasUpperCase) feedback.push('Incluye mayúsculas');
    if (!checks.hasLowerCase) feedback.push('Incluye minúsculas');
    if (!checks.hasNumbers) feedback.push('Incluye números');
    if (!checks.hasSpecialChar) feedback.push('Incluye caracteres especiales');

    return feedback;
  }
}
```

### 6. Sistema de Backup/Restore con GitHub API

**Nuevo: `src/services/BackupService.ts`**
```typescript
import { Octokit } from '@octokit/rest';
import { SecureMedicalStorage } from './SecureStorage';
import { CryptoService } from './CryptoService';
import { BackupMetadata } from '@/types/backup';

export class BackupService {
  private octokit: Octokit | null = null;
  private storage: SecureMedicalStorage;
  private crypto: CryptoService;

  constructor() {
    this.storage = new SecureMedicalStorage();
    this.crypto = new CryptoService();
  }

  async initializeGitHubToken(token: string): Promise<boolean> {
    try {
      this.octokit = new Octokit({ auth: token });

      // Verificar token
      const { data } = await this.octokit.users.getAuthenticated();
      console.log('Autenticado como:', data.login);

      return true;
    } catch (error) {
      console.error('Error inicializando GitHub API:', error);
      return false;
    }
  }

  async createBackup(password: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Obtener todos los registros médicos
      const records = await this.storage.getMedicalRecords();

      // Crear metadata del backup
      const metadata: BackupMetadata = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        patientId: 'blanca-primary',
        recordCount: records.length,
        checksum: '' // Se calculará después
      };

      // Encriptar datos
      const backupData = {
        metadata,
        records: await this.encryptRecords(records)
      };

      // Generar checksum
      metadata.checksum = await this.generateChecksum(JSON.stringify(backupData));

      // Crear archivo JSON
      const filename = `blancalergic-backup-${new Date().toISOString().split('T')[0]}.json`;
      const content = JSON.stringify(backupData, null, 2);

      // Subir a GitHub
      if (this.octokit) {
        const { data } = await this.octokit.repos.createOrUpdateFileContents({
          owner: 'sergiohb21', // Reemplazar con usuario real
          repo: 'BlancAlergic-APP',
          path: `backups/${filename}`,
          message: `Backup automático ${new Date().toISOString()}`,
          content: btoa(content)
        });

        // Registrar exportación en base de datos local
        await this.storage.exportHistory.add({
          exportType: 'github',
          timestamp: new Date(),
          fileSize: content.length,
          status: 'success',
          fileId: data.content?.sha
        });

        return {
          success: true,
          url: data.content?.html_url
        };
      }

      return { success: false, error: 'GitHub API no inicializada' };
    } catch (error) {
      console.error('Error creando backup:', error);
      return { success: false, error: 'Error creando backup' };
    }
  }

  async restoreBackup(backupContent: string, password: string): Promise<{ success: boolean; imported: number; error?: string }> {
    try {
      const backupData = JSON.parse(atob(backupContent));

      // Verificar checksum
      const currentChecksum = await this.generateChecksum(JSON.stringify({
        ...backupData,
        metadata: { ...backupData.metadata, checksum: '' }
      }));

      if (currentChecksum !== backupData.metadata.checksum) {
        throw new Error('Checksum inválido - archivo corrupto');
      }

      // Desencriptar registros
      const records = await this.decryptRecords(backupData.records, password);

      // Importar a base de datos local
      let imported = 0;
      for (const record of records) {
        await this.storage.saveMedicalRecord(record);
        imported++;
      }

      return { success: true, imported };
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return { success: false, imported: 0, error: 'Error restaurando backup' };
    }
  }

  async createQRCodeBackup(): Promise<string> {
    // Implementar generación de QR code para backup
    const records = await this.storage.getMedicalRecords();
    const compressedData = await this.compressData(JSON.stringify(records));
    return compressedData;
  }

  private async encryptRecords(records: any[]): Promise<string> {
    const dataString = JSON.stringify(records);
    return await this.crypto.encrypt(dataString);
  }

  private async decryptRecords(encryptedData: string, password: string): Promise<any[]> {
    await this.crypto.initializeWithPassword(password);
    const decryptedString = await this.crypto.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  private async generateChecksum(data: string): Promise<string> {
    // Implementar checksum SHA-256
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async compressData(data: string): Promise<string> {
    // Implementar compresión para QR code
    return data; // Placeholder
  }
}
```

### 7. Componentes Premium Clave

**Nuevo: `src/components/auth/ProtectedRoute.tsx`**
```typescript
import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from './AuthDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { state, actions } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, mostrar diálogo de login
  if (!state.isAuthenticated) {
    return <AuthDialog />;
  }

  // Si necesita configurar contraseña
  if (state.needsSetup) {
    return <PasswordSetup onSetup={actions.setupPassword} />;
  }

  // Si la sesión está bloqueada
  if (state.isLocked) {
    return <SessionUnlock onUnlock={actions.unlockSession} />;
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
}
```

**Modificación: `src/components/layout/Header.tsx`**
```typescript
// Extender Header existente con items premium
import { useAuth } from '@/hooks/useAuth';
import { Lock, Unlock, History, Pill, Calendar, Backup } from 'lucide-react';

export function Header() {
  const { state, actions } = useAuth();
  const location = useLocation();

  const premiumNavItems = [
    { path: '/historial-medico', icon: History, label: 'Historial Médico' },
    { path: '/medicamentos', icon: Pill, label: 'Medicamentos' },
    { path: '/visitas-medicas', icon: Calendar, label: 'Visitas Médicas' },
    { path: '/backup-restore', icon: Backup, label: 'Backup' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo y navegación existente */}
        <Navigation />

        {/* Indicador de estado premium */}
        <div className="flex items-center space-x-2">
          {state.isAuthenticated ? (
            <button
              onClick={actions.logout}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
            >
              <Unlock className="h-4 w-4" />
              <span>Premium</span>
            </button>
          ) : (
            <button
              onClick={() => {/* Abrir AuthDialog */}}
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Lock className="h-4 w-4" />
              <span>Premium</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegación premium si está autenticado */}
      {state.isAuthenticated && (
        <nav className="border-t bg-muted/50">
          <div className="container flex max-w-screen-2xl">
            {premiumNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === item.path ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
```

### 8. Gestión de Sesión y Seguridad

**Nuevo: `src/services/SessionManager.ts`**
```typescript
export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly LOCK_TIMEOUT = 15 * 60 * 1000; // 15 minutos
  private readonly WARNING_TIMEOUT = 2 * 60 * 1000; // 2 minutos antes

  startSession(): void {
    this.clearSession();
    this.resetTimeout();

    // Event listeners para actividad del usuario
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.resetTimeout.bind(this), true);
    });
  }

  clearSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Remover event listeners
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.removeEventListener(event, this.resetTimeout.bind(this), true);
    });
  }

  private resetTimeout(): void {
    this.clearSession();

    // Mostrar advertencia 2 minutos antes del bloqueo
    this.timeoutId = setTimeout(() => {
      this.showSessionWarning();
    }, this.LOCK_TIMEOUT - this.WARNING_TIMEOUT);
  }

  private showSessionWarning(): void {
    // Emitir evento para mostrar modal de advertencia
    window.dispatchEvent(new CustomEvent('sessionWarning'));

    // Bloquear sesión después de 2 minutos
    setTimeout(() => {
      this.lockSession();
    }, this.WARNING_TIMEOUT);
  }

  private lockSession(): void {
    // Emitir evento para bloquear sesión
    window.dispatchEvent(new CustomEvent('sessionLock'));
    this.clearSession();
  }

  extendSession(): void {
    this.resetTimeout();
  }
}
```

### 9. Tipos de TypeScript

**Nuevo: `src/types/auth.ts`**
```typescript
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  needsSetup: boolean;
  isLocked: boolean;
  error: string | null;
  user: {
    id: string;
    name: string;
    hasPremium: boolean;
  } | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SETUP_START' }
  | { type: 'SETUP_SUCCESS' }
  | { type: 'SETUP_FAILURE'; payload: string }
  | { type: 'SESSION_LOCK' }
  | { type: 'SESSION_UNLOCK' };

export interface LoginCredentials {
  password: string;
  rememberMe?: boolean;
}

export interface PasswordSetup {
  password: string;
  confirmPassword: string;
  hint?: string;
}
```

**Nuevo: `src/types/encryption.ts`**
```typescript
export interface EncryptedMedicalRecord {
  id?: number;
  patientId: string;
  recordType: string;
  encryptedData: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordStrength {
  score: number; // 0-5
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
}

export interface AppConfig {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}
```

### 10. Implementación por Fases

#### Fase 1: Fundación de Autenticación (Semana 1-2)
- Configurar dependencias y estructura básica
- Implementar AuthContext y hooks básicos
- Crear ProtectedRoute wrapper
- Implementar diálogo de login básico
- Configurar IndexedDB con Dexie.js

#### Fase 2: Encriptación y Almacenamiento Seguro (Semana 3-4)
- Implementar CryptoService con libsodium
- Crear SecureStorage con encriptación
- Implementar gestión de sesiones y timeout
- Crear UI de configuración de contraseña
- Migrar datos existentes a formato encriptado

#### Fase 3: Componentes Premium (Semana 5-6)
- Implementar páginas premium (MedicalHistory, Medications, etc.)
- Crear navegación premium con indicadores visuales
- Implementar formularios médicos complejos
- Agregar indicadores de encriptación y seguridad

#### Fase 4: Backup/Restore (Semana 7-8)
- Implementar GitHub API integration
- Crear sistema de backup automático
- Implementar restore con verificación de integridad
- Agregar QR codes para backup rápido
- Implementar exportación/importación de datos

#### Fase 5: Testing y Optimización (Semana 9-10)
- Testing de seguridad y penetración
- Optimización de performance para grandes datasets
- Testing de accesibilidad WCAG 2.1 AA
- Testing PWA offline capabilities
- Documentation y deployment

### 11. Consideraciones de Seguridad

#### Encriptación
- **Algoritmo**: AES-256-GCM con libsodium
- **Key Derivation**: PBKDF2 con 100,000 iteraciones
- **Key Rotation**: Cada 90 días
- **Salt Management**: Salt único por usuario

#### Almacenamiento
- **Primary**: IndexedDB encriptado
- **Fallback**: Nada sensible en localStorage
- **Integrity**: SHA-256 checksums
- **Audit Trail**: Log completo de accesos

#### Autenticación
- **Password Requirements**: Mínimo 12 caracteres, complejidad alta
- **Session Management**: Auto-lock 15 minutos
- **Rate Limiting**: Máximo 5 intentos fallidos
- **Secure Storage**: Nunca almacenar contraseña en plaintext

#### Red y API
- **GitHub Integration**: Personal access tokens
- **Transport Encryption**: HTTPS obligatorio
- **Data Minimization**: Solo datos necesarios
- **Zero Knowledge**: Arquitectura de conocimiento cero

### 12. Performance Optimizations

#### Database Operations
- **Lazy Loading**: Cargar datos bajo demanda
- **Virtual Scrolling**: Para listas grandes
- **Index Optimization**: Índices por tipo y fecha
- **Batch Operations**: Agrupar escrituras

#### UI Performance
- **React.memo**: Para componentes estáticos
- **useMemo/useCallback**: Para cálculos costosos
- **Code Splitting**: Lazy loading de rutas premium
- **Web Workers**: Para operaciones criptográficas

#### Memory Management
- **LRU Cache**: Para datos frecuentes
- **Cleanup**: Proper disposal de listeners
- **Monitoring**: Memory usage tracking
- **Garbage Collection**: Manual cuando necesario

### 13. Estrategia de Migración

#### Migración de Datos Existentes
```typescript
// Migration script
export async function migrateToSecureStorage(masterPassword: string): Promise<void> {
  const secureStorage = new SecureMedicalStorage();
  const cryptoService = new CryptoService();

  // 1. Inicializar con contraseña maestra
  await secureStorage.initializeDatabase(masterPassword);

  // 2. Obtener datos existentes del localStorage o estado actual
  const existingAllergies = getExistingAllergyData(); // Function existente

  // 3. Transformar a formato médico extendido
  const medicalRecords = existingAllergies.map(allergy => ({
    type: 'allergy',
    patientId: 'blanca-primary',
    data: {
      ...allergy,
      recordDate: new Date(),
      lastUpdated: new Date(),
      severity: mapIntensityToSeverity(allergy.intensity),
      notes: '',
      doctor: '',
      location: ''
    }
  }));

  // 4. Guardar en almacenamiento seguro
  for (const record of medicalRecords) {
    await secureStorage.saveMedicalRecord(record);
  }

  // 5. Verificar integridad
  const savedRecords = await secureStorage.getMedicalRecords('allergy');
  if (savedRecords.length !== medicalRecords.length) {
    throw new Error('Error en migración - registros no coinciden');
  }

  // 6. Limpiar datos antiguos (opcional, con backup)
  // clearLegacyData();
}
```

#### Backward Compatibility
- Mantener interfaces existentes funcionando
- Gradual migration de features
- Fallbacks para usuarios no premium
- Preservar experiencia PWA existente

### 14. Testing Strategy

#### Unit Testing
- **AuthContext**: Login/logout flows
- **CryptoService**: Encripción/desencripción
- **SecureStorage**: Database operations
- **SessionManager**: Timeout handling

#### Integration Testing
- **Authentication Flow**: Login → Premium Access → Logout
- **Data Encryption**: End-to-end encryption testing
- **Backup/Restore**: Complete backup and restore cycles
- **Migration**: Data migration verification

#### E2E Testing
- **User Journeys**: Complete premium user workflows
- **Security Testing**: Authentication bypass attempts
- **Performance Testing**: Large dataset handling
- **Accessibility Testing**: WCAG 2.1 AA compliance

#### Security Testing
- **Penetration Testing**: Attempted security breaches
- **Data Integrity**: Tampering detection
- **Encryption Strength**: Cryptographic validation
- **Session Security**: Session hijacking prevention

### 15. Deployment Considerations

#### GitHub Pages Limitations
- **Static Site**: No backend authentication
- **Client-Side Only**: Todo en el navegador
- **No Server Secrets**: Tokens almacenados localmente
- **CORS Considerations**: GitHub API access

#### Build Optimizations
- **Bundle Splitting**: Separate premium bundles
- **Tree Shaking**: Remove unused dependencies
- **Compression**: Gzip/Brotli optimization
- **CDN**: Static asset optimization

#### Progressive Web App
- **Offline Capabilities**: Cached premium features
- **App Shell**: Instant loading experience
- **Background Sync**: Auto-sync when online
- **Installable**: Native app experience

---

## Resumen de Implementación

Este plan de arquitectura proporciona una ruta completa para implementar un sistema híbrido seguro en BlancAlergic-APP que:

1. **Mantiene compatibilidad** con la experiencia PWA existente
2. **Añade capacidades premium** con autenticación por contraseña
3. **Implementa seguridad de nivel médico** con encriptación AES-256
4. **Preserva datos existentes** con migración segura
5. **Optimiza performance** para grandes conjuntos de datos médicos
6. **Mantienen accesibilidad** WCAG 2.1 AA
7. **Soporta PWA offline** con caching inteligente

La implementación está diseñada para ser modular, segura y escalable, con una clara separación entre áreas públicas y premium mientras se mantiene una experiencia de usuario coherente y profesional.