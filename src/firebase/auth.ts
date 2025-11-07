import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User as AuthUser,
  UserCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { FirebaseUser, MedicalProfile, SyncStatus } from './types';

// Provider para Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'online'
});

/**
 * Iniciar sesión con Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Crear o actualizar perfil médico básico después del login
    await createOrUpdateMedicalProfile(result.user);

    return result;
  } catch (error: unknown) {
    console.error('Error en Google Sign-In:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
    throw new Error(errorMessage);
  }
};

/**
 * Cerrar sesión
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error('Error al cerrar sesión:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
    throw new Error(errorMessage);
  }
};

/**
 * Crear o actualizar perfil médico básico
 */
export const createOrUpdateMedicalProfile = async (user: AuthUser): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    // Crear perfil médico inicial
    const initialProfile: Omit<MedicalProfile, 'id'> = {
      userId: user.uid,
      displayName: user.displayName || 'Usuario',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      bloodType: '',
      birthDate: '',
      gender: 'otro',
      allergies: [],
      medications: [],
      medicalVisits: [],
      vaccinations: [],
      labResults: [],
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now
    };

    await setDoc(userRef, {
      ...initialProfile,
      id: user.uid
    });
  } else {
    // Actualizar último acceso
    await setDoc(userRef, {
      ...userSnap.data(),
      lastAccessAt: now,
      lastSyncAt: now
    }, { merge: true });
  }
};

/**
 * Obtener perfil médico del usuario
 */
export const getMedicalProfile = async (userId: string): Promise<MedicalProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as MedicalProfile;
    }
    return null;
  } catch (error: unknown) {
    console.error('Error al obtener perfil médico:', error);
    throw new Error('Error al cargar el perfil médico');
  }
};

/**
 * Observador de cambios en autenticación
 */
export const onAuthStateChanged = (
  callback: (user: AuthUser | null) => void
): Unsubscribe => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Verificar si hay una sesión activa
 */
export const getCurrentUser = (): AuthUser | null => {
  return auth.currentUser;
};

/**
 * Refrescar token de autenticación
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      const tokenResult = await user.getIdTokenResult(true);
      return tokenResult.token;
    }
    return null;
  } catch (error) {
    console.error('Error refrescando token:', error);
    return null;
  }
};

/**
 * Obtener estado de sincronización actual
 */
export const getSyncStatus = (): SyncStatus => {
  return {
    lastSyncAt: new Date().toISOString(),
    isOnline: navigator.onLine,
    pendingChanges: 0,
    syncInProgress: false
  };
};

/**
 * Utilidad para formatear el usuario de Firebase
 */
export const formatFirebaseUser = (user: AuthUser): FirebaseUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    metadata: {
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    }
  };
};