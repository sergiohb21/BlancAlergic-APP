import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import GoogleLogin from './GoogleLogin';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/'
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Pantalla de carga mientras se verifica autenticación
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Usuario no autenticado - mostrar pantalla de login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Área Médica Protegida
            </h2>
            <p className="text-gray-600 mb-8">
              Esta sección contiene información médica confidencial.
              Inicia sesión con Google para acceder.
            </p>
          </div>

          <GoogleLogin
            onSuccess={() => {
              // La redirección se manejará automáticamente por el ProtectedRoute
            }}
            onError={(error) => {
              logger.error({ error }, 'Authentication error in ProtectedRoute');
            }}
          />

          <div className="mt-6 text-center">
            <a
              href={redirectTo}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Volver a la aplicación principal
            </a>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              🔒 Tu información está segura
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Encriptación de grado médico</li>
              <li>• Solo tú puedes acceder a tus datos</li>
              <li>• Sincronización segura en la nube</li>
              <li>• Compatible con HIPAA y GDPR</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado - mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;