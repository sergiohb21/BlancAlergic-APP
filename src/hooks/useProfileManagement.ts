import { useState, useCallback, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import {
  getUserProfile,
  updateUserProfile,
  getUserAllergies,
  addUserAllergy,
  updateUserAllergy,
  deleteUserAllergy
} from '../firebase/firestore';
import { UserProfile, AllergyRecord } from '../firebase/types';

interface UseProfileManagementReturn {
  profile: UserProfile | null;
  allergies: AllergyRecord[];
  loading: boolean;
  error: string | null;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  addAllergy: (allergy: Omit<AllergyRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAllergy: (id: string, updates: Partial<AllergyRecord>) => Promise<void>;
  deleteAllergy: (id: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfileManagement = (userId: string | undefined): UseProfileManagementReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSyncStatus('syncing');
      setError(null);

      const [profileData, allergiesData] = await Promise.all([
        getUserProfile(userId),
        getUserAllergies(userId)
      ]);

      setProfile(profileData);
      setAllergies(allergiesData);
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar perfil';
      setError(errorMessage);
      setSyncStatus('error');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      await updateUserProfile(userId, updates);
      setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  const uploadProfilePhoto = useCallback(async (file: File): Promise<string> => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      // Validar archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('La imagen no debe superar los 5MB');
      }

      // Subir a Firebase Storage
      const storageRef = ref(storage, `profile-photos/${userId}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Actualizar perfil con la nueva URL
      await updateProfile({ photoURL: downloadURL });

      setSyncStatus('synced');
      return downloadURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir foto';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId, updateProfile]);

  const addAllergy = useCallback(async (allergy: Omit<AllergyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      const newAllergy = await addUserAllergy(userId, allergy);
      setAllergies(prev => [...prev, newAllergy]);
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar alergia';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  const updateAllergy = useCallback(async (id: string, updates: Partial<AllergyRecord>) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      await updateUserAllergy(userId, id, updates);
      setAllergies(prev =>
        prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
      );
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar alergia';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  const deleteAllergy = useCallback(async (id: string) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      await deleteUserAllergy(userId, id);
      setAllergies(prev => prev.filter(a => a.id !== id));
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar alergia';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    profile,
    allergies,
    loading,
    error,
    syncStatus,
    updateProfile,
    uploadProfilePhoto,
    addAllergy,
    updateAllergy,
    deleteAllergy,
    refreshProfile
  };
};