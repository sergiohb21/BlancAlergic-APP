import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

interface DebugInfo {
  envVars?: Record<string, string>;
  firebaseConfig?: Record<string, string>;
  services?: Record<string, string>;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  timestamp: string;
}

const FirebaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ timestamp: new Date().toISOString() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugFirebase = async () => {
      try {
        // 1. Verificar variables de entorno
        const envVars = {
          VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Cargado' : '❌ No cargado',
          VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '❌ No cargado',
          VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '❌ No cargado',
          VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '❌ No cargado',
        };

        // 2. Intentar inicializar Firebase
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
        };

        let appStatus = '❌ Error al inicializar';
        let authStatus = '❌ Error al inicializar Auth';
        let firestoreStatus = '❌ Error al inicializar Firestore';
        let currentUser = null;

        try {
          const app = initializeApp(firebaseConfig);
          appStatus = '✅ App inicializada correctamente';

          // Probar Auth
          const auth = getAuth(app);
          authStatus = '✅ Auth inicializado correctamente';

          // Verificar usuario actual
          onAuthStateChanged(auth, (user) => {
            currentUser = user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            } : null;
          });

          // Probar Firestore
          getFirestore(app);
          firestoreStatus = '✅ Firestore inicializado correctamente';

          setDebugInfo({
            envVars,
            firebaseConfig: {
              apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : '❌',
              authDomain: firebaseConfig.authDomain,
              projectId: firebaseConfig.projectId,
              appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : '❌',
            },
            services: {
              app: appStatus,
              auth: authStatus,
              firestore: firestoreStatus
            },
            currentUser,
            timestamp: new Date().toISOString()
          });

        } catch (error: unknown) {
          const firebaseError = error as { message?: string; code?: string; stack?: string };
          setDebugInfo({
            envVars,
            error: {
              message: firebaseError.message || 'Unknown error',
              code: firebaseError.code,
              stack: firebaseError.stack
            },
            timestamp: new Date().toISOString()
          });
        }

      } catch (error: unknown) {
        const generalError = error as { message?: string; stack?: string };
        setDebugInfo({
          error: {
            message: generalError.message || 'Unknown error',
            stack: generalError.stack
          },
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    debugFirebase();
  }, []);

  if (loading) {
    return <div>Cargando debug de Firebase...</div>;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>🔥 Firebase Debug</h3>
      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '300px' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: '10px', padding: '5px 10px' }}
      >
        Reload
      </button>
    </div>
  );
};

export default FirebaseDebug;