import React, { useEffect } from 'react';
import { useAllergies } from '@/contexts/AppContext';
import { arrayAlergias } from '@/const/alergias';

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
        console.error('Error initializing app:', error);
        setError('Error al cargar los datos de alergias');
        setLoading(false);
      }
    };

    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since this is initialization code

  return <>{children}</>;
}