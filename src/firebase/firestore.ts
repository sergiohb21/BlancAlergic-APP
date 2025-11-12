import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { logger } from '@/utils/logger';
import { db } from './config';
import {
  MedicalProfile,
  AllergyRecord,
  MedicationRecord,
  MedicalVisitRecord,
  VaccinationRecord,
  LabResultRecord,
  MedicalDataExport,
  SyncStatus,
  MedicalRecord,
  UserProfile
} from './types';

/**
 * Perfil Médico
 */

// User profile management functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        displayName: data.displayName || '',
        email: data.email || '',
        phone: data.phone,
        birthDate: data.birthDate,
        emergencyContact: data.emergencyContact?.name || data.emergencyContact,
        emergencyPhone: data.emergencyContact?.phone || data.emergencyPhone,
        bloodType: data.bloodType,
        medicalNotes: data.medicalNotes,
        photoURL: data.photoURL,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    logger.error({ error, userId }, 'Error getting user profile');
    throw new Error('No se pudo cargar el perfil de usuario');
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, userId }, 'Error updating user profile');
    throw new Error('No se pudo actualizar el perfil de usuario');
  }
};

// Enhanced allergy functions
export const addUserAllergy = async (
  userId: string,
  allergyData: Omit<AllergyRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AllergyRecord> => {
  try {
    const allergiesCollection = collection(db, 'users', userId, 'allergies');
    const newAllergy = {
      ...allergyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(allergiesCollection, newAllergy);
    return {
      id: docRef.id,
      ...newAllergy
    };
  } catch (error) {
    logger.error({ error, userId }, 'Error adding user allergy');
    throw new Error('No se pudo añadir la alergia');
  }
};

export const updateUserAllergy = async (
  userId: string,
  allergyId: string,
  allergyData: Partial<AllergyRecord>
): Promise<void> => {
  try {
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    await updateDoc(allergyRef, {
      ...allergyData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, userId, allergyId }, 'Error updating user allergy');
    throw new Error('No se pudo actualizar la alergia');
  }
};

export const deleteUserAllergy = async (userId: string, allergyId: string): Promise<void> => {
  try {
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    await deleteDoc(allergyRef);
  } catch (error) {
    logger.error({ error, userId, allergyId }, 'Error deleting user allergy');
    throw new Error('No se pudo eliminar la alergia');
  }
};

export const getUserAllergies = async (userId: string): Promise<AllergyRecord[]> => {
  try {
    const allergiesCollection = collection(db, 'users', userId, 'allergies');
    const q = query(allergiesCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AllergyRecord[];
  } catch (error) {
    logger.error({ error, userId }, 'Error getting user allergies');
    throw new Error('No se pudieron cargar las alergias');
  }
};

// Medical records functions
export const getMedicalHistory = async (userId: string): Promise<{ records: MedicalRecord[], allergies: AllergyRecord[] }> => {
  try {
    // Get medical records collection
    const recordsCollection = collection(db, 'users', userId, 'medicalRecords');
    const recordsQuery = query(recordsCollection, orderBy('date', 'desc'));
    const recordsSnapshot = await getDocs(recordsQuery);

    const records = recordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicalRecord[];

    // Get allergies
    const allergies = await getUserAllergies(userId);

    return { records, allergies };
  } catch (error) {
    logger.error({ error, userId }, 'Error getting medical history');
    throw new Error('No se pudo cargar el historial médico');
  }
};

export const addMedicalRecord = async (
  userId: string,
  recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MedicalRecord> => {
  try {
    const recordsCollection = collection(db, 'users', userId, 'medicalRecords');
    const newRecord = {
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(recordsCollection, newRecord);
    return {
      id: docRef.id,
      ...newRecord
    };
  } catch (error) {
    logger.error({ error, userId }, 'Error adding medical record');
    throw new Error('No se pudo añadir el registro médico');
  }
};

export const updateMedicalRecord = async (
  userId: string,
  recordId: string,
  recordData: Partial<MedicalRecord>
): Promise<void> => {
  try {
    const recordRef = doc(db, 'users', userId, 'medicalRecords', recordId);
    await updateDoc(recordRef, {
      ...recordData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, userId, recordId }, 'Error updating medical record');
    throw new Error('No se pudo actualizar el registro médico');
  }
};

export const deleteMedicalRecord = async (userId: string, recordId: string): Promise<void> => {
  try {
    const recordRef = doc(db, 'users', userId, 'medicalRecords', recordId);
    await deleteDoc(recordRef);
  } catch (error) {
    logger.error({ error, userId, recordId }, 'Error deleting medical record');
    throw new Error('No se pudo eliminar el registro médico');
  }
};

export const updateMedicalProfile = async (
  userId: string,
  profileData: Partial<MedicalProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, userId }, 'Error updating medical profile');
    throw new Error('No se pudo actualizar el perfil médico');
  }
};

export const getMedicalProfileData = async (userId: string): Promise<MedicalProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as MedicalProfile;
    }
    return null;
  } catch (error) {
    logger.error({ error, userId }, 'Error getting medical profile data');
    throw new Error('No se pudo cargar el perfil médico');
  }
};

/**
 * Alergias
 */

export const addAllergy = async (
  userId: string,
  allergyData: Omit<AllergyRecord, 'id' | 'lastUpdated'>
): Promise<string> => {
  try {
    const allergiesCollection = collection(db, 'users', userId, 'allergies');
    const newAllergy = {
      ...allergyData,
      lastUpdated: new Date().toISOString()
    };

    const docRef = await addDoc(allergiesCollection, newAllergy);

    // Actualizar perfil con nueva alergia
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      allergies: arrayUnion(docRef.id),
      updatedAt: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    logger.error({ error, userId }, 'Error adding allergy');
    throw new Error('No se pudo añadir la alergia');
  }
};

export const updateAllergy = async (
  userId: string,
  allergyId: string,
  allergyData: Partial<AllergyRecord>
): Promise<void> => {
  try {
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    await updateDoc(allergyRef, {
      ...allergyData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, userId, allergyId }, 'Error updating allergy');
    throw new Error('No se pudo actualizar la alergia');
  }
};

export const deleteAllergy = async (userId: string, allergyId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Eliminar documento de alergia
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    batch.delete(allergyRef);

    // Actualizar perfil eliminando referencia
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      allergies: arrayRemove(allergyId),
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  } catch (error) {
    logger.error({ error, userId, allergyId }, 'Error deleting allergy');
    throw new Error('No se pudo eliminar la alergia');
  }
};

export const getAllergies = async (userId: string): Promise<AllergyRecord[]> => {
  try {
    const allergiesCollection = collection(db, 'users', userId, 'allergies');
    const q = query(allergiesCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AllergyRecord[];
  } catch (error) {
    logger.error({ error, userId }, 'Error getting allergies');
    throw new Error('No se pudieron cargar las alergias');
  }
};

/**
 * Medicamentos
 */

export const addMedication = async (
  userId: string,
  medicationData: Omit<MedicationRecord, 'id'>
): Promise<string> => {
  try {
    const medicationsCollection = collection(db, 'users', userId, 'medications');
    const docRef = await addDoc(medicationsCollection, medicationData);

    // Actualizar perfil con nuevo medicamento
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      medications: arrayUnion(docRef.id),
      updatedAt: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    logger.error({ error, userId }, 'Error adding medication');
    throw new Error('No se pudo añadir el medicamento');
  }
};

export const getMedications = async (userId: string): Promise<MedicationRecord[]> => {
  try {
    const medicationsCollection = collection(db, 'users', userId, 'medications');
    // Consulta temporal sin índice compuesto - solo ordenar por name
    const q = query(medicationsCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);

    const allMedications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicationRecord[];

    // Filtrar localmente por active=true
    return allMedications.filter(med => med.active === true);
  } catch (error) {
    logger.error({ error, userId }, 'Error getting medications');
    throw new Error('No se pudieron cargar los medicamentos');
  }
};

/**
 * Visitas Médicas
 */

export const addMedicalVisit = async (
  userId: string,
  visitData: Omit<MedicalVisitRecord, 'id'>
): Promise<string> => {
  try {
    const visitsCollection = collection(db, 'users', userId, 'medicalVisits');
    const docRef = await addDoc(visitsCollection, visitData);

    return docRef.id;
  } catch (error) {
    logger.error({ error, userId }, 'Error adding medical visit');
    throw new Error('No se pudo añadir la visita médica');
  }
};

export const getMedicalVisits = async (
  userId: string,
  limitTo?: number
): Promise<MedicalVisitRecord[]> => {
  try {
    const visitsCollection = collection(db, 'users', userId, 'medicalVisits');
    let q = query(visitsCollection, orderBy('date', 'desc'));

    if (limitTo) {
      q = query(q, limit(limitTo));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicalVisitRecord[];
  } catch (error) {
    logger.error({ error, userId }, 'Error getting medical visits');
    throw new Error('No se pudieron cargar las visitas médicas');
  }
};

/**
 * Vacunas
 */

export const addVaccination = async (
  userId: string,
  vaccinationData: Omit<VaccinationRecord, 'id'>
): Promise<string> => {
  try {
    const vaccinationsCollection = collection(db, 'users', userId, 'vaccinations');
    const docRef = await addDoc(vaccinationsCollection, vaccinationData);

    return docRef.id;
  } catch (error) {
    logger.error({ error, userId }, 'Error adding vaccination');
    throw new Error('No se pudo añadir la vacuna');
  }
};

export const getVaccinations = async (userId: string): Promise<VaccinationRecord[]> => {
  try {
    const vaccinationsCollection = collection(db, 'users', userId, 'vaccinations');
    const q = query(vaccinationsCollection, orderBy('administrationDate', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VaccinationRecord[];
  } catch (error) {
    logger.error({ error, userId }, 'Error getting vaccinations');
    throw new Error('No se pudieron cargar las vacunas');
  }
};

/**
 * Resultados de Laboratorio
 */

export const addLabResult = async (
  userId: string,
  labResultData: Omit<LabResultRecord, 'id'>
): Promise<string> => {
  try {
    const labResultsCollection = collection(db, 'users', userId, 'labResults');
    const docRef = await addDoc(labResultsCollection, labResultData);

    return docRef.id;
  } catch (error) {
    logger.error({ error, userId }, 'Error adding lab result');
    throw new Error('No se pudo añadir el resultado de laboratorio');
  }
};

export const getLabResults = async (userId: string): Promise<LabResultRecord[]> => {
  try {
    const labResultsCollection = collection(db, 'users', userId, 'labResults');
    const q = query(labResultsCollection, orderBy('resultDate', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LabResultRecord[];
  } catch (error) {
    logger.error({ error, userId }, 'Error getting lab results');
    throw new Error('No se pudieron cargar los resultados de laboratorio');
  }
};

/**
 * Utilidades
 */

export const exportMedicalData = async (userId: string): Promise<MedicalDataExport> => {
  try {
    const profile = await getMedicalProfileData(userId);
    const allergies = await getAllergies(userId);
    const medications = await getMedications(userId);
    const visits = await getMedicalVisits(userId);
    const vaccinations = await getVaccinations(userId);
    const labResults = await getLabResults(userId);

    if (!profile) {
      throw new Error('No se encontró perfil médico');
    }

    const exportData: MedicalDataExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: {
        ...profile,
        allergies,
        medications,
        medicalVisits: visits,
        vaccinations,
        labResults
      },
      checksum: 'placeholder' // TODO: Implementar checksum real
    };

    return exportData;
  } catch (error) {
    logger.error({ error, userId }, 'Error exporting medical data');
    throw new Error('No se pudieron exportar los datos médicos');
  }
};

/**
 * Sincronización
 */

export const getSyncStatus = async (userId: string): Promise<SyncStatus> => {
  try {
    const profile = await getMedicalProfileData(userId);
    return {
      lastSyncAt: profile?.lastSyncAt || new Date().toISOString(),
      isOnline: navigator.onLine,
      pendingChanges: 0, // TODO: Implementar tracking de cambios pendientes
      syncInProgress: false
    };
  } catch (error) {
    return {
      lastSyncAt: new Date().toISOString(),
      isOnline: navigator.onLine,
      pendingChanges: 0,
      syncInProgress: false,
      error: 'Error obteniendo estado de sincronización'
    };
  }
};