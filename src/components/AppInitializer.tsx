import React, { useEffect } from 'react';
import { useAllergies } from '@/hooks/useAllergies';
import { arrayAlergias } from '@/const/alergias';
import { logger } from '@/utils/logger';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { setAllergies, setLoading, setError } = useAllergies();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // Simular una pequeña demora para mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 500));

        // Cargar las alergias en el estado global
        setAllergies(arrayAlergias);

        setLoading(false);
      } catch (error) {
        logger.error({ error }, 'Error initializing app');
        setError('Error al cargar los datos de alergias');
        setLoading(false);
      }
    };

    initializeApp();
  }, [setAllergies, setLoading, setError]); // Include all dependencies

  return <>{children}</>;
}