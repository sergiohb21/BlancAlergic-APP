// Tipos base para Firebase
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// Tipos de datos médicos para Firestore
export interface MedicalProfile {
  id: string;
  userId: string;
  displayName: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType: string;
  birthDate: string;
  gender: 'masculino' | 'femenino' | 'otro';
  allergies: AllergyRecord[];
  medications: MedicationRecord[];
  medicalVisits: MedicalVisitRecord[];
  vaccinations: VaccinationRecord[];
  labResults: LabResultRecord[];
  createdAt: string;
  updatedAt: string;
  lastSyncAt: string;
}

export interface AllergyRecord {
  id: string;
  name: string;
  category: string;
  intensity: 'Baja' | 'Media' | 'Alta';
  KUA_Litro?: number;
  isAlergic: boolean;
  symptoms: string[];
  reactions: string[];
  emergencyMedication?: string;
  notes: string;
  diagnosedDate: string;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecord {
  id: string;
  type: 'visit' | 'test' | 'vaccination' | 'medication' | 'document' | 'other';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  location?: string;
  result?: string;
  nextAction?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id?: string;
  displayName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  medicalNotes?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'intravenosa' | 'intramuscular' | 'tópica' | 'inhalada';
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  reason: string;
  active: boolean;
  sideEffects: string[];
  notes: string;
  reminderTimes: string[];
}

export interface MedicalVisitRecord {
  id: string;
  date: string;
  type: 'consulta' | 'urgencias' | 'revisión' | 'procedimiento' | 'vacunación';
  specialty: string;
  doctor: string;
  hospital: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  medicationsPrescribed: string[];
  nextAppointment?: string;
  notes: string;
  documents: MedicalDocument[];
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  vaccineType: string;
  administrationDate: string;
  nextDoseDate?: string;
  administeredBy: string;
  batchNumber: string;
  adverseReactions: string[];
  notes: string;
}

export interface LabResultRecord {
  id: string;
  testName: string;
  category: string;
  resultDate: string;
  results: LabResult[];
  normalRange: string;
  doctor: string;
  laboratory: string;
  notes: string;
  document?: MedicalDocument;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'alto' | 'bajo' | 'crítico';
}

export interface MedicalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'report';
  url: string;
  uploadedAt: string;
  size: number;
  description?: string;
}

// Estado de sincronización
export interface SyncStatus {
  lastSyncAt: string;
  isOnline: boolean;
  pendingChanges: number;
  syncInProgress: boolean;
  error?: string;
}

// Contexto de autenticación
export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  medicalProfile: MedicalProfile | null;
  syncStatus: SyncStatus;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshMedicalProfile: () => Promise<void>;
}

// Errores personalizados
export interface FirebaseError {
  code: string;
  message: string;
  type: 'auth' | 'firestore' | 'storage' | 'network';
}

// Tipos de exportación/importación
export interface MedicalDataExport {
  version: string;
  exportDate: string;
  profile: MedicalProfile;
  checksum: string;
}

export interface BackupOptions {
  includeDocuments: boolean;
  format: 'json' | 'encrypted';
  destination: 'local' | 'cloud' | 'both';
}