import { useState, useEffect, useCallback } from 'react';
import {
  getMedicalHistory,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} from '../firebase/firestore';
import { MedicalRecord, AllergyRecord } from '../firebase/types';

interface UseMedicalDataReturn {
  records: MedicalRecord[];
  allergies: AllergyRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<MedicalRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

export const useMedicalData = (userId: string | undefined): UseMedicalDataReturn => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');

  const fetchRecords = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSyncStatus('syncing');
      setError(null);

      const medicalHistory = await getMedicalHistory(userId);
      const records = medicalHistory.records || [];
      const allergies = medicalHistory.allergies || [];

      setRecords(records);
      setAllergies(allergies);
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos médicos';
      setError(errorMessage);
      setSyncStatus('error');
      console.error('Error fetching medical data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addRecord = useCallback(async (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      const newRecord = await addMedicalRecord(userId, record);
      setRecords(prev => [...prev, newRecord]);
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar registro';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  const updateRecord = useCallback(async (id: string, record: Partial<MedicalRecord>) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      await updateMedicalRecord(userId, id, record);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, ...record, updatedAt: new Date().toISOString() } : r));
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar registro';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  const deleteRecord = useCallback(async (id: string) => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setSyncStatus('syncing');
      setError(null);

      await deleteMedicalRecord(userId, id);
      setRecords(prev => prev.filter(r => r.id !== id));
      setSyncStatus('synced');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar registro';
      setError(errorMessage);
      setSyncStatus('error');
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
    records,
    allergies,
    loading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    syncStatus
  };
};