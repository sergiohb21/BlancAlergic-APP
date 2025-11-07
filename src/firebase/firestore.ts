import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import {
  MedicalProfile,
  AllergyRecord,
  MedicationRecord,
  MedicalVisitRecord,
  VaccinationRecord,
  LabResultRecord,
  MedicalDataExport,
  SyncStatus
} from './types';

/**
 * Perfil Médico
 */

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
    console.error('Error actualizando perfil médico:', error);
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
    console.error('Error obteniendo perfil médico:', error);
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
    console.error('Error añadiendo alergia:', error);
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
    console.error('Error actualizando alergia:', error);
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
    console.error('Error eliminando alergia:', error);
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
    console.error('Error obteniendo alergias:', error);
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
    console.error('Error añadiendo medicamento:', error);
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
    console.error('Error obteniendo medicamentos:', error);
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
    console.error('Error añadiendo visita médica:', error);
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
    console.error('Error obteniendo visitas médicas:', error);
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
    console.error('Error añadiendo vacuna:', error);
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
    console.error('Error obteniendo vacunas:', error);
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
    console.error('Error añadiendo resultado de laboratorio:', error);
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
    console.error('Error obteniendo resultados de laboratorio:', error);
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
    console.error('Error exportando datos médicos:', error);
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