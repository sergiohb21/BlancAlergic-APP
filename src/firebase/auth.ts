import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
import { arrayAlergias } from '@/const/alergias';
import { logger } from '@/utils/logger';

// Provider para Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account', // Mejor para login
  access_type: 'online'
});


/**
 * Iniciar sesión con Google (con fallback automático)
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Validar que la configuración de Firebase sea correcta antes de intentar auth
    const config = (auth as any).app?.options;
    if (!config?.apiKey) {
      throw new Error('La configuración de Firebase no es válida. Faltan credenciales.');
    }

    // Intentar primero con popup (mejor UX)
    const result = await signInWithPopup(auth, googleProvider);

    // Crear o actualizar perfil médico básico después del login
    await createOrUpdateMedicalProfile(result.user);

    return result;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    // Manejo específico para errores de configuración
    if (firebaseError.code === 'auth/invalid-api-key') {
      logger.error({ error: firebaseError }, 'Error de API key inválida - Configuración incorrecta');
      throw new Error('Error de configuración de Firebase. Contacte al administrador.');
    }

    // Si es error de popup cerrado o COOP, usar redirect
    if (firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request' ||
        firebaseError.message?.includes('Cross-Origin-Opener-Policy')) {

      logger.warn({ error: firebaseError, message: 'Popup failed, trying redirect' }, 'Authentication popup failed, attempting redirect');

      try {
        await signInWithRedirect(auth, googleProvider);
        // Esto redirigirá la página, así que no continuaremos aquí
        throw new Error('REDIRECT_INITIATED');
      } catch (redirectError: unknown) {
        logger.error({ error: redirectError }, 'Authentication redirect failed');
        throw new Error('No se pudo iniciar sesión. Intenta recargar la página.');
      }
    }

    // Para otros errores, lanzar normalmente
    logger.error({ error, code: firebaseError?.code }, 'Google Sign-In error');
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
    throw new Error(errorMessage);
  }
};

/**
 * Manejar resultado de redirect después del login
 */
export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // Crear o actualizar perfil médico después del redirect
      await createOrUpdateMedicalProfile(result.user);
      return result;
    }
    return null;
  } catch (error: unknown) {
    logger.error({ error }, 'Error handling authentication redirect result');
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar inicio de sesión';
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
    logger.error({ error }, 'Error handling authentication redirect result');
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

    // Migrar automáticamente las alergias públicas al perfil privado
    await migratePublicAllergiesToProfile(user.uid);
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
 * Migrar alergias públicas al perfil médico privado
 */
const migratePublicAllergiesToProfile = async (userId: string): Promise<void> => {
  try {
    // Obtener las alergias públicas que marcan isAlergic: true
    const publicAllergies = arrayAlergias.filter(alergia => alergia.isAlergic);

    // Crear registros de alergias en la subcolección
    for (const publicAllergy of publicAllergies) {
      const allergyRef = doc(db, 'users', userId, 'allergies', `migrated_${Date.now()}_${publicAllergy.name.replace(/\s+/g, '_').toLowerCase()}`);

      const allergyRecord = {
        name: publicAllergy.name,
        intensity: publicAllergy.intensity,
        category: publicAllergy.category,
        kuaLitro: publicAllergy.KUA_Litro || 0,
        reactionType: 'Inmediata',
        symptoms: [],
        notes: `Alergia migrada automáticamente desde perfil público - KUA/Litro: ${publicAllergy.KUA_Litro || 'No registrado'}`,
        diagnosedDate: new Date().toISOString().split('T')[0],
        lastReactionDate: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(allergyRef, allergyRecord);
    }

    logger.info(`Se han migrado ${publicAllergies.length} alergias públicas al perfil del usuario ${userId}`);
  } catch (error) {
    logger.error({ error }, 'Sign out error');
    // No lanzamos el error para no interrumpir el proceso de login
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
    logger.error({ error, userId }, 'Error migrating public allergies');
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
    const currentUser = auth.currentUser;
    if (currentUser) {
      const tokenResult = await currentUser.getIdTokenResult(true);
      return tokenResult.token;
    }
    return null;
  } catch (error: unknown) {
    logger.error({ error, userId: auth.currentUser?.uid }, 'Error refreshing auth token');
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