import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOutUser, signInWithGoogle, getMedicalProfile, handleRedirectResult } from '../firebase/auth';
import { FirebaseUser, MedicalProfile, AuthContextType, SyncStatus } from '../firebase/types';
import { formatFirebaseUser, getSyncStatus } from '../firebase/auth';
import { logger } from '@/utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());

  // Efecto para observar cambios en autenticación y manejar redirects
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Primero, verificar si hay un resultado de redirect
        await handleRedirectResult();

        const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const formattedUser = formatFirebaseUser(firebaseUser);
              setUser(formattedUser);

              // Cargar perfil médico
              const profile = await getMedicalProfile(firebaseUser.uid);
              setMedicalProfile(profile);

              // Actualizar estado de sincronización
              setSyncStatus(getSyncStatus());
            } else {
              setUser(null);
              setMedicalProfile(null);
              setSyncStatus(getSyncStatus());
            }
          } catch (error) {
            logger.error({ msg: 'Error en AuthContext', error });
            // En caso de error, limpiar estado
            setUser(null);
            setMedicalProfile(null);
          } finally {
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        logger.error({ msg: 'Error inicializando autenticación', error });
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []);

  // Efecto para escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: true
      }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para login con Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Si es redirect, la página se recargará, sino onAuthStateChanged actualizará el estado
    } catch (error: unknown) {
      setLoading(false);
      // Si es un redirect iniciado, no lanzar error
      if (error instanceof Error && error.message === 'REDIRECT_INITIATED') {
        return;
      }
      throw error;
    }
  };

  // Función para logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOutUser();
      // El efecto onAuthStateChanged se encargará de limpiar el estado
    } catch (error: unknown) {
      setLoading(false);
      throw error;
    }
  };

  // Función para refrescar perfil médico
  const refreshMedicalProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getMedicalProfile(user.uid);
      setMedicalProfile(profile);

      // Actualizar timestamp de sincronización
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString()
      }));
    } catch (error) {
      logger.error({ msg: 'Error refrescando perfil médico', error });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    medicalProfile,
    syncStatus,
    loginWithGoogle,
    logout,
    refreshMedicalProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };