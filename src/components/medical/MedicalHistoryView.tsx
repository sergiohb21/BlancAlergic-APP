import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@/utils/logger';
import {
  User,
  Shield,
  FileText,
  AlertTriangle,
  Heart,
  Download,
  Phone,
  ChevronRight,
  Menu,
  Home,
  Search,
  Table,
  Calendar,
  Syringe,
  TestTube,
  FileImage
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MedicalHistory } from './MedicalHistory';
import {
  getMedicalProfileData,
  getAllergies,
  getMedications,
  getMedicalVisits,
  getVaccinations,
  getLabResults
} from '@/firebase/firestore';
import { MedicalProfile, AllergyRecord, VaccinationRecord, LabResultRecord } from '@/firebase/types';
import { arrayAlergias } from '@/const/alergias';

// Tipos para datos médicos
interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
  startDate: string;
  endDate?: string;
  doctor?: string;
  notes?: string;
}

interface MedicalVisitRecord {
  id: string;
  date: string;
  doctor: string;
  reason: string;
  type: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
}

interface MedicalHistoryViewProps {
  className?: string;
}

const MedicalHistoryView: React.FC<MedicalHistoryViewProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sincronizar el estado del tab con los parámetros URL para persistencia
  const activeTab = (searchParams.get('tab') as 'history' | 'sections' | 'emergency') || 'history';

  const setActiveTab = (tab: 'history' | 'sections' | 'emergency') => {
    setSearchParams({ tab });
  };
  const [medicalData, setMedicalData] = useState<{
    profile: MedicalProfile | null;
    allergies: AllergyRecord[];
    medications: MedicationRecord[];
    visits: MedicalVisitRecord[];
    vaccinations: VaccinationRecord[];
    labResults: LabResultRecord[];
  }>({
    profile: null,
    allergies: [],
    medications: [],
    visits: [],
    vaccinations: [],
    labResults: []
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos médicos al montar el componente
  useEffect(() => {
    if (user) {
      loadMedicalData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMedicalData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [profile, allergies, medications, visits, vaccinations, labResults] = await Promise.all([
        getMedicalProfileData(user.uid),
        getAllergies(user.uid),
        getMedications(user.uid),
        getMedicalVisits(user.uid),
        getVaccinations(user.uid),
        getLabResults(user.uid)
      ]);

      setMedicalData({
        profile,
        allergies,
        medications,
        visits,
        vaccinations,
        labResults
      });
    } catch (error) {
      logger.error({ error }, 'Error cargando datos médicos');
    } finally {
      setLoading(false);
    }
  };

  // Función para migrar alergias públicas al perfil privado
  const migratePublicAllergies = async () => {
    if (!user || !medicalData.profile) return;

    try {
      // Obtener las alergias públicas que marcan isAlergic: true
      const publicAllergies = arrayAlergias.filter(alergia => alergia.isAlergic);

      // Migrar solo si no hay alergias privadas aún
      if (medicalData.allergies.length === 0) {
        // Importamos dinámicamente para evitar problemas de importación circular
        const { addAllergy } = await import('@/firebase/firestore');

        for (const publicAllergy of publicAllergies) {
          await addAllergy(user.uid, {
            name: publicAllergy.name,
            intensity: publicAllergy.intensity,
            category: publicAllergy.category,
            KUA_Litro: publicAllergy.KUA_Litro,
            isAlergic: true,
            symptoms: [],
            reactions: ['Reacción alérgica estándar'],
            notes: `Alergia migrada desde perfil público - KUA/Litro: ${publicAllergy.KUA_Litro}`,
            diagnosedDate: new Date().toISOString().split('T')[0]
          });
        }

        // Recargar datos después de migrar
        await loadMedicalData();
        alert('Se han migrado tus alergias públicas a tu perfil médico privado.');
      } else {
        alert('Ya tienes alergias registradas en tu perfil médico.');
      }
    } catch (error) {
      logger.error({ error }, 'Error migrando alergias');
      alert('Error al migrar alergias. Por favor, intenta de nuevo.');
    }
  };

  // Navegación a secciones médicas
  const medicalSections = [
    {
      id: 'perfil',
      title: 'Mi Perfil Médico',
      description: 'Información personal y datos de contacto',
      icon: User,
      path: '/perfil-medico',
      color: 'text-primary',
      bgColor: 'bg-muted'
    },
    {
      id: 'alergias',
      title: 'Mis Alergias',
      description: 'Gestiona tus alergias y reacciones',
      icon: Shield,
      path: '/mis-alergias',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      id: 'medicamentos',
      title: 'Medicamentos',
      description: 'Control de medicamentos actuales',
      icon: FileText,
      path: '/medicamentos',
      color: 'text-primary',
      bgColor: 'bg-muted'
    },
    {
      id: 'visitas',
      title: 'Historial de Visitas',
      description: 'Registro de consultas médicas',
      icon: Calendar,
      path: '/visitas-medicas',
      color: 'text-foreground',
      bgColor: 'bg-accent'
    },
    {
      id: 'vacunas',
      title: 'Vacunación',
      description: 'Historial de vacunas recibidas',
      icon: Syringe,
      path: '/vacunas',
      color: 'text-foreground',
      bgColor: 'bg-accent'
    },
    {
      id: 'laboratorio',
      title: 'Resultados de Laboratorio',
      description: 'Análisis y pruebas médicas',
      icon: TestTube,
      path: '/resultados-laboratorio',
      color: 'text-foreground',
      bgColor: 'bg-accent'
    },
    {
      id: 'informes',
      title: 'Informes Médicos',
      description: 'Sube y gestiona informes y documentos',
      icon: FileImage,
      path: '/informes-medicos',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  
  // Calcular estadísticas
  const stats = {
    totalAllergies: medicalData.allergies.length,
    activeMedications: medicalData.medications.filter(m => m.active).length,
    recentVisits: medicalData.visits.filter(v => {
      const visitDate = new Date(v.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return visitDate >= thirtyDaysAgo;
    }).length,
    upcomingVaccines: medicalData.vaccinations.filter(v => {
      if (!v.nextDoseDate) return false;
      return new Date(v.nextDoseDate) >= new Date();
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando tu historial médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 space-y-6 ${className}`}>

      {/* Alerta de migración de alergias si no hay datos */}
      {medicalData.profile && medicalData.allergies.length === 0 && (
        <Card className="border-border bg-muted">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-foreground text-sm">
                  Parece que no tienes alergias registradas. ¿Quieres migrar tus alergias públicas a tu perfil médico privado?
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={migratePublicAllergies}
                className="w-full sm:w-auto min-h-[44px] px-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Migrar Alergias
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel principal con tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'history' | 'sections' | 'emergency')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-16 p-1">
          <TabsTrigger
            value="history"
            className="flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px]"
            aria-label="Ver historial médico"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Historial</span>
          </TabsTrigger>
          <TabsTrigger
            value="sections"
            className="flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px]"
            aria-label="Ver secciones médicas"
          >
            <Menu className="h-4 w-4" />
            <span className="text-xs font-medium">Secciones</span>
          </TabsTrigger>
          <TabsTrigger
            value="emergency"
            className="flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px]"
            aria-label="Ver información de emergencia"
          >
            <Phone className="h-4 w-4" />
            <span className="text-xs font-medium">Emergencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Historial Médico */}
        <TabsContent value="history" className="mt-6">
          <MedicalHistory
            patientName={medicalData.profile?.displayName || user?.displayName || 'Usuario'}
            patientBirthDate={medicalData.profile?.birthDate ? new Date(medicalData.profile.birthDate) : new Date('2010-05-15')}
          />
        </TabsContent>

  
        {/* Tab de Secciones */}
        <TabsContent value="sections" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Home className="h-5 w-5" />
                  Funciones Públicas
                </CardTitle>
                <CardDescription>
                  Acceso a la información general de alergias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 'buscar',
                    title: 'Buscar Alergias',
                    description: 'Busca información detallada sobre alergias específicas',
                    icon: Search,
                    path: '/buscarAlergias',
                    color: 'text-primary',
                    bgColor: 'bg-muted'
                  },
                  {
                    id: 'emergencias',
                    title: 'Protocolo de Emergencia',
                    description: 'Pasos a seguir en caso de reacción alérgica',
                    icon: AlertTriangle,
                    path: '/emergencias',
                    color: 'text-destructive',
                    bgColor: 'bg-destructive/10'
                  },
                  {
                    id: 'tabla',
                    title: 'Tabla de Alergias',
                    description: 'Vista completa de todas las alergias y sus niveles',
                    icon: Table,
                    path: '/tablaAlergias',
                    color: 'text-foreground',
                    bgColor: 'bg-accent'
                  }
                ].map((section) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${section.bgColor} hover:shadow-md min-h-[44px] flex items-center`}
                    onClick={() => handleNavigate(section.path)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ir a ${section.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(section.path);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${section.bgColor}`}>
                          <section.icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base">{section.title}</div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {section.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${section.color} flex-shrink-0`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Mi Perfil Médico Privado
                </CardTitle>
                <CardDescription>
                  Gestión de tu historial médico personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {medicalSections.map((section) => {
                  const count = section.id === 'alergias' ? stats.totalAllergies :
                               section.id === 'medicamentos' ? stats.activeMedications :
                               section.id === 'visitas' ? stats.recentVisits :
                               section.id === 'vacunas' ? stats.upcomingVaccines : 0;

                  return (
                    <div
                      key={section.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${section.bgColor} hover:shadow-md min-h-[44px]`}
                      onClick={() => handleNavigate(section.path)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ir a ${section.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigate(section.path);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${section.bgColor}`}>
                          <section.icon className={`h-5 w-5 ${section.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {section.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        )}
                        <ChevronRight className={`h-5 w-5 ${section.color}`} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Emergencia */}
        <TabsContent value="emergency" className="mt-6">
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-destructive mb-2">Contacto de Emergencia:</div>
                  <div className="text-sm space-y-1">
                    <div>📞 {medicalData.profile?.emergencyContact?.name || 'No configurado'}</div>
                    <div>📱 {medicalData.profile?.emergencyContact?.phone || 'No configurado'}</div>
                    <div>🏥 {medicalData.profile?.bloodType || 'Tipo de sangre no registrado'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-destructive mb-2">Acciones en Emergencia:</div>
                  <div className="text-sm space-y-1">
                    <div>1. Administrar EpiPen si disponible</div>
                    <div>2. Llamar emergencias (112)</div>
                    <div>3. Contactar al alergólogo</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalHistoryView;