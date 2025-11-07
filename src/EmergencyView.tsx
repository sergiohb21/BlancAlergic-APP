import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Info, Heart, MapPin, User, Clock } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { EmergencyTimer } from "@/components/EmergencyTimer";
import { preloadCriticalImages } from "@/lib/image-utils";
import { logger } from "@/utils/logger";

// Import images as modules for proper Vite processing
import call112Image from "/Image/call-112.jpg";
import identifySymptomsImage from "/Image/identify-symptoms.png";
import epiPenImage from "/Image/epi-pen.jpg";
import waitHelpImage from "/Image/wait-help.jpg";

interface Step {
  id: string;
  imgPath: string;
  titleText: string;
  infoText: string;
  moreInfo: string;
  buttonAction?: () => void;
  buttonText: string;
  icon: React.ReactNode;
  isEmergency?: boolean; // Flag for critical medical images
}

// Memoized components for performance
const EmergencyStep = React.memo(({
  step,
  onToggleInfo,
  showMoreInfo,
  emergencyData,
  onEmergencyDataChange,
  onRefreshLocation,
  onRequestLocationPermission,
  locationPermissionDenied
}: {
  step: Step;
  onToggleInfo: (stepId: string) => void;
  showMoreInfo: boolean;
  emergencyData?: EmergencyInfo;
  onEmergencyDataChange?: (field: keyof EmergencyInfo, value: string) => void;
  onRefreshLocation?: () => void;
  onRequestLocationPermission?: () => void;
  locationPermissionDenied?: boolean;
}) => {
  const handleButtonClick = useCallback(() => {
    if (step.buttonAction) {
      step.buttonAction();
    } else {
      onToggleInfo(step.id);
    }
  }, [step, onToggleInfo]);

  // Special rendering for 112 emergency card
  if (step.id === 'llamar-112' && emergencyData && onEmergencyDataChange) {
    return (
      <div className="space-y-4">
        <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 text-destructive">
                {step.icon}
              </div>
              <CardTitle className="text-xl font-semibold">{step.titleText}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/3">
                <img
                  src={step.imgPath}
                  alt={step.titleText}
                  className="w-full h-48 object-cover rounded-lg"
                  loading="eager"
                  decoding="async"
                  onLoad={() => {
                    logger.debug(`Emergency medical image loaded: ${step.id}`);
                  }}
                  onError={(error) => {
                    console.error(`❌ Failed to load emergency image: ${step.id}`, error);
                    console.warn(`Critical emergency image failed: ${step.id}`);
                  }}
                />
              </div>
              <div className="md:w-2/3 space-y-3">
                <CardDescription className="text-base leading-relaxed">
                  {step.infoText}
                </CardDescription>
                <Button
                  onClick={handleButtonClick}
                  className="w-full h-18 md:h-20 lg:h-20 text-lg md:text-xl font-bold animate-pulse border-4 border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  variant="destructive"
                  size="lg"
                  aria-label={step.buttonText.includes("CONFIRMAR")
                    ? "Confirmar llamada de emergencia al 112. Esta acción marcará inmediatamente."
                    : "Llamar a emergencias médicas al 112. Es la acción más crítica."
                  }
                >
                  <Phone className="mr-3 h-6 w-6" />
                  {step.buttonText}
                </Button>
                <Button
                  onClick={() => onToggleInfo(step.id)}
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  Más Información
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Information Dropdown - More Info */}
        {showMoreInfo && (
          <Card className="bg-destructive/5 border-2 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-foreground w-full">
                  <p className="font-medium mb-4 text-foreground text-lg">Información Crítica para el 112</p>

                  <div className="space-y-6">
                    {/* Location Information */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Ubicación Actual</span>
                      </label>
                      <div className="bg-background p-3 rounded-lg border">
                        <div className="space-y-2">
                          <p className="text-xs font-mono break-all">{emergencyData.location}</p>
                          {emergencyData.address && (
                            <p className="text-sm font-medium">📍 {emergencyData.address}</p>
                          )}
                          {emergencyData.city && emergencyData.city !== 'Ciudad no especificada' && (
                            <p className="text-sm text-muted-foreground dark:text-gray-400">🏙️ {emergencyData.city}</p>
                          )}
                          {emergencyData.location.includes('Precisión:') && (
                            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                              💡 **Consejo de precisión:** La precisión GPS ideal para emergencias es &lt; 10 metros
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={onRefreshLocation}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Actualizar GPS
                          </Button>
                          {locationPermissionDenied && onRequestLocationPermission && (
                            <Button
                              onClick={onRequestLocationPermission}
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                            >
                              Solicitar Permisos
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Fecha y Hora</span>
                      </label>
                      <div className="bg-background p-3 rounded-lg border">
                        <p className="text-xs">{emergencyData.timestamp}</p>
                      </div>
                    </div>

                    {/* Victim Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium">
                          <User className="h-4 w-4" />
                          <span>Nombre</span>
                        </label>
                        <input
                          type="text"
                          value={emergencyData.victimName}
                          onChange={(e) => onEmergencyDataChange('victimName', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm bg-background"
                          placeholder="Nombre completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">¿Qué comió?</label>
                        <textarea
                          value={emergencyData.whatAte}
                          onChange={(e) => onEmergencyDataChange('whatAte', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm bg-background"
                          rows={2}
                          placeholder="Describir lo que ha comido"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Síntomas</label>
                        <textarea
                          value={emergencyData.symptoms}
                          onChange={(e) => onEmergencyDataChange('symptoms', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm bg-background"
                          rows={2}
                          placeholder="Describir síntomas actuales"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Alergias conocidas (opcional)</label>
                        <textarea
                          value={emergencyData.allergies}
                          onChange={(e) => onEmergencyDataChange('allergies', e.target.value)}
                          className="w-full p-2 border rounded-md text-sm bg-background"
                          rows={2}
                          placeholder="Listar posibles alergias ingeridas"
                        />
                      </div>
                    </div>

                    {/* Emergency Summary */}
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                      <h4 className="font-medium text-destructive mb-2 text-sm">📞 Texto para leer al 112:</h4>
                      <div className="bg-background p-3 rounded text-xs font-mono whitespace-pre-wrap mb-3">
                        {`EMERGENCIA ALÉRGICA
Ubicación: ${emergencyData.location}${emergencyData.address ? `\nDirección: ${emergencyData.address}` : ''}${emergencyData.city && emergencyData.city !== 'Ciudad no especificada' ? `\nCiudad: ${emergencyData.city}` : ''}
Hora: ${emergencyData.timestamp}
Nombre: ${emergencyData.victimName || 'No especificado'}
Qué comió: ${emergencyData.whatAte || 'No especificado'}
Síntomas: ${emergencyData.symptoms || 'No especificados'}
Alergias: ${emergencyData.allergies || 'No especificadas'}`}
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="text-xs font-medium text-blue-800 mb-2">⚠️ Pasos inmediatos:</p>
                        <ol className="text-xs space-y-1 text-blue-700">
                          <li>1. Protege a la víctima de peligros</li>
                          <li>2. Mantén vía aérea despejada</li>
                          <li>3. No dar nada de comer/beber</li>
                          <li>4. Administra EpiPen si disponible</li>
                          <li>5. Mantén víctima tranquila y vigilada</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Regular step rendering for other cards
  return (
    <div className="space-y-4">
      <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-destructive">
              {step.icon}
            </div>
            <CardTitle className="text-xl font-semibold">{step.titleText}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <img
                src={step.imgPath}
                alt={step.titleText}
                className="w-full h-48 object-cover rounded-lg"
                loading={step.isEmergency ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => {
                  if (step.isEmergency) {
                    logger.debug(`Emergency medical image loaded: ${step.id}`);
                  }
                }}
                onError={(error) => {
                  console.error(`❌ Failed to load emergency image: ${step.id}`, error);
                  if (step.isEmergency) {
                    console.warn(`Critical emergency image failed: ${step.id}`);
                  }
                }}
              />
            </div>
            <div className="md:w-2/3 space-y-3">
              <CardDescription className="text-base leading-relaxed">
                {step.infoText}
              </CardDescription>
              <Button
                onClick={handleButtonClick}
                className={`
                  ${step.id === 'llamar-112'
                    ? 'w-full h-18 md:h-20 lg:h-20 text-lg md:text-xl font-bold animate-pulse border-4 border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
                    : 'w-full md:w-auto'
                  }
                `}
                variant={step.buttonText.includes("LLAMAR") || step.buttonText.includes("CONFIRMAR") ? "destructive" : "default"}
                size={step.id === 'llamar-112' ? "lg" : "default"}
                aria-label={step.id === 'llamar-112'
                  ? step.buttonText.includes("CONFIRMAR")
                    ? "Confirmar llamada de emergencia al 112. Esta acción marcará inmediatamente."
                    : "Llamar a emergencias médicas al 112. Es la acción más crítica."
                  : step.buttonText
                }
              >
                {(step.buttonText.includes("LLAMAR") || step.buttonText.includes("CONFIRMAR")) && (
                  <Phone className="mr-3 h-6 w-6" />
                )}
                {step.buttonText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showMoreInfo && (
        <Card className="bg-accent border-border">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-foreground">
                <p className="font-medium mb-1 text-foreground">Información adicional:</p>
                <p className="text-sm leading-relaxed">{step.moreInfo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.step.id === nextProps.step.id &&
    prevProps.showMoreInfo === nextProps.showMoreInfo &&
    JSON.stringify(prevProps.emergencyData) === JSON.stringify(nextProps.emergencyData)
  );
});

// Interface para la información de emergencia
interface EmergencyInfo {
  victimName: string;
  whatAte: string;
  symptoms: string;
  allergies: string;
  location: string;
  address: string;
  city: string;
  postalCode?: string;
  timestamp: string;
}

const EmergencyView: React.FC = React.memo((): JSX.Element => {
  const [showMoreInfo, setShowMoreInfo] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showCallConfirmation, setShowCallConfirmation] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>({
    victimName: "",
    whatAte: "",
    symptoms: "",
    allergies: "",
    location: "Obteniendo ubicación...",
    address: "",
    city: "",
    postalCode: "",
    timestamp: new Date().toLocaleString('es-ES')
  });

  // Función para obtener dirección a partir de coordenadas (geocoding inverso)
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      // Usar OpenStreetMap Nominatim API (gratuito y no requiere API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es`,
        {
          headers: {
            'User-Agent': 'BlancAlergic-APP/1.0 (Emergency Medical App)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta del servicio de geocoding');
      }

      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        const formattedAddress = [
          address.road || address.pedestrian || address.highway,
          address.house_number,
          address.suburb,
          address.city || address.town || address.village,
          address.postcode
        ].filter(Boolean).join(', ');

        setEmergencyInfo(prev => ({
          ...prev,
          address: formattedAddress || 'Dirección no disponible',
          city: address.city || address.town || address.village || 'Ciudad no especificada',
          postalCode: address.postcode || ''
        }));
      } else {
        setEmergencyInfo(prev => ({
          ...prev,
          address: 'Dirección no disponible',
          city: 'Ciudad no especificada',
          postalCode: ''
        }));
      }
    } catch (error) {
      logger.error({ msg: 'Error obteniendo dirección', error });
      // No mostrar error al usuario, solo dejar campos vacíos
      setEmergencyInfo(prev => ({
        ...prev,
        address: 'Dirección no disponible',
        city: 'Ciudad no especificada',
        postalCode: ''
      }));
    }
  }, []);

  // Función para solicitar permisos de ubicación y obtener coordenadas + dirección
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setEmergencyInfo(prev => ({
        ...prev,
        location: "Geolocalización no disponible en este dispositivo",
        address: "Dirección no disponible",
        city: "Ciudad no especificada"
      }));
      return;
    }

    // Reiniciar estado de permiso denegado
    setLocationPermissionDenied(false);

    // Mostrar estado de búsqueda
    setEmergencyInfo(prev => ({
      ...prev,
      location: "🔍 Buscando ubicación GPS precisa...",
      address: "Obteniendo dirección...",
      city: ""
    }));

    // Función para intentar obtener ubicación con alta precisión
    const attemptHighAccuracyLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          const locationString = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)} (Precisión: ±${Math.round(accuracy)}m)`;

          logger.info(`📍 GPS obtenido - Precisión: ${accuracy}m`);

          setEmergencyInfo(prev => ({
            ...prev,
            location: locationString
          }));

          setLocationPermissionDenied(false);

          // Obtener dirección usando geocoding inverso
          await reverseGeocode(latitude, longitude);
        },
        async (error) => {
          logger.error({ msg: 'Error con alta precisión, intentando con precisión normal', error });

          // Si falla alta precisión, intentar con precisión normal
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              const locationString = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)} (Precisión: ±${Math.round(accuracy)}m)`;

              logger.info(`📍 GPS obtenido (baja precisión) - Precisión: ${accuracy}m`);

              setEmergencyInfo(prev => ({
                ...prev,
                location: locationString
              }));

              setLocationPermissionDenied(false);
              await reverseGeocode(latitude, longitude);
            },
            (error) => {
              logger.error({ msg: 'Error obteniendo ubicación', error });
              let errorMessage = "No se pudo obtener la ubicación.";

              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = "🚫 Permiso de ubicación denegado. Activa el GPS y pulsa 'Solicitar Permisos'.";
                  setLocationPermissionDenied(true);
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = "📡 Señal de GPS no disponible. Intenta desde una zona con mejor cobertura o cerca de una ventana.";
                  break;
                case error.TIMEOUT:
                  errorMessage = "⏰ Tiempo de espera agotado. Intenta nuevamente o asegúrate de tener buena visibilidad del cielo.";
                  break;
                default:
                  errorMessage = "❌ Error desconocido al obtener ubicación.";
              }

              setEmergencyInfo(prev => ({
                ...prev,
                location: errorMessage,
                address: "Dirección no disponible",
                city: "Ciudad no especificada"
              }));
            },
            {
              enableHighAccuracy: false, // Precisión normal como fallback
              timeout: 30000, // 30 segundos para mayor tiempo
              maximumAge: 60000 // Permitir caché de 1 minuto
            }
          );
        },
        {
          enableHighAccuracy: true, // Máxima precisión primero
          timeout: 45000, // 45 segundos para alta precisión
          maximumAge: 0 // Sin caché para obtener datos frescos
        }
      );
    };

    // Iniciar el proceso de obtención de ubicación
    attemptHighAccuracyLocation();
  }, [reverseGeocode]);

  // Función para solicitar permisos de ubicación manualmente
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setEmergencyInfo(prev => ({
        ...prev,
        location: "Geolocalización no disponible en este dispositivo"
      }));
      return;
    }

    // Para browsers que soportan la API de permisos
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          // Si está denegado, mostrar mensaje para que el usuario lo cambie manualmente
          alert('Para habilitar la ubicación:\n\n1. Haz clic en el ícono de candado o información en la barra de direcciones\n2. Busca "Ubicación" o "Location"\n3. Cambia a "Permitir"\n4. Recarga la página y pulsa "Solicitar Permisos" nuevamente');
        } else {
          // Si no está denegado, intentar obtener ubicación
          getCurrentLocation();
        }
      }).catch(() => {
        // Si no se puede consultar permisos, intentar directamente
        getCurrentLocation();
      });
    } else {
      // Si no hay API de permisos, intentar directamente
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  // Preload critical emergency images on component mount
  useEffect(() => {
    preloadCriticalImages([call112Image, epiPenImage]).catch((error) => {
        logger.error('Error preloading emergency images:', error);
      });

    // Obtener ubicación actual al cargar el componente
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Manejar cambios en el formulario de información de emergencia
  const handleEmergencyInfoChange = useCallback((field: keyof EmergencyInfo, value: string) => {
    setEmergencyInfo(prev => ({
      ...prev,
      [field]: value,
      timestamp: new Date().toLocaleString('es-ES')
    }));
  }, []);

  // Generar resumen para leer al 112
  const generateEmergencySummary = useCallback(() => {
    const summary = `
EMERGENCIA ALÉRGICA
Ubicación: ${emergencyInfo.location}
Hora: ${emergencyInfo.timestamp}
Nombre: ${emergencyInfo.victimName || 'No especificado'}
Qué comió: ${emergencyInfo.whatAte || 'No especificado'}
Síntomas: ${emergencyInfo.symptoms || 'No especificados'}
Alergias: ${emergencyInfo.allergies || 'No especificadas'}
    `.trim();

    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }

    return summary;
  }, [emergencyInfo]);

  // Enhanced emergency call with double confirmation
  const handleEmergencyCall = useCallback(() => {
    if (!showCallConfirmation) {
      setShowCallConfirmation(true);
      // Auto-hide confirmation after 5 seconds for safety
      setTimeout(() => setShowCallConfirmation(false), 5000);
    } else {
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Generar y copiar resumen antes de llamar
      generateEmergencySummary();

      // Realizar llamada
      window.location.href = "tel:112";
    }
  }, [showCallConfirmation, generateEmergencySummary]);

  // Memoize emergency steps to prevent recreation
  const steps: Step[] = useMemo(() => [
    {
      id: "llamar-112",
      imgPath: call112Image,
      titleText: "Llamar al 112",
      infoText:
        "En caso de una reacción alérgica grave, lo primero que debe hacer es llamar al 112 para solicitar ayuda médica de emergencia.",
      moreInfo:
        "Marcar el 112 conectará directamente con los servicios de emergencia. Esta es la acción más crítica en una emergencia alérgica.",
      buttonAction: handleEmergencyCall,
      buttonText: showCallConfirmation ? "CONFIRMAR LLAMADA" : "LLAMAR AL 112",
      icon: <Phone className="h-8 w-8" />,
      isEmergency: true // CRITICAL: Emergency call button
    },
    {
      id: "identificar-sintomas",
      imgPath: identifySymptomsImage,
      titleText: "Identificar Síntomas",
      infoText:
        "Revise si la persona tiene síntomas de una reacción alérgica grave, como dificultad para respirar, hinchazón de la cara o labios, o erupciones en la piel.",
      moreInfo:
        "Los síntomas pueden variar, pero incluyen hinchazón, urticaria, dificultad para respirar y anafilaxia.",
      buttonText: "Más Información",
      icon: <Info className="h-6 w-6" />,
    },
    {
      id: "usar-epipen",
      imgPath: epiPenImage,
      titleText: "Usar EpiPen",
      infoText:
        "Si la persona tiene un EpiPen, administre la inyección de adrenalina en el muslo exterior. Esto puede ayudar a reducir los síntomas mientras espera la llegada de la ayuda médica.",
      moreInfo:
        "Asegúrese de seguir las instrucciones del EpiPen y mantenga la calma.",
      buttonText: "Más Información",
      icon: <AlertTriangle className="h-6 w-6" />,
      isEmergency: true // CRITICAL: Life-saving medical device
    },
    {
      id: "esperar-ayuda",
      imgPath: waitHelpImage,
      titleText: "Esperar la Ayuda",
      infoText:
        "Mantenga a la persona cómoda y en una posición que facilite la respiración mientras espera la llegada de los servicios de emergencia.",
      moreInfo:
        "Intente mantener a la persona tranquila y vigilada en todo momento.",
      buttonText: "Más Información",
      icon: <Heart className="h-6 w-6" />,
    },
  ], [handleEmergencyCall, showCallConfirmation]);

  // Memoize toggle function to prevent recreation
  const toggleMoreInfo = useCallback((stepId: string) => {
    setShowMoreInfo((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  }, []);

  return (
    <ErrorBoundary mode="medical" componentName="EmergencyView" showEmergencyInfo={true}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Emergency Header with Timer */}
        <div className="text-center mb-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-destructive">Protocolo de Emergencia Alergénica</h1>
            <p className="text-lg text-muted-foreground dark:text-gray-300">
              Siga estos pasos críticos en caso de una reacción alérgica grave
            </p>
          </div>

          {/* Emergency Timer */}
          <div className="flex justify-center">
            <EmergencyTimer
              startTime={Date.now()}
              className="border-2 border-destructive/20 rounded-xl p-4 bg-destructive/5"
            />
          </div>
        </div>

        {/* Emergency Steps with Prioritized Layout */}
        <div className="space-y-8">
          {/* Critical Emergency Actions - Full Width Priority */}
          {steps.filter(step => step.isEmergency).map((step) => (
            <ErrorBoundary
              key={step.id}
              componentName={`EmergencyStep-${step.id}`}
              showEmergencyInfo={step.id === 'llamar-112'}
            >
              <div className={step.id === 'llamar-112' ? '' : ''}>
                <EmergencyStep
                  step={step}
                  onToggleInfo={toggleMoreInfo}
                  showMoreInfo={!!showMoreInfo[step.id]}
                  emergencyData={step.id === 'llamar-112' ? emergencyInfo : undefined}
                  onEmergencyDataChange={step.id === 'llamar-112' ? handleEmergencyInfoChange : undefined}
                  onRefreshLocation={step.id === 'llamar-112' ? getCurrentLocation : undefined}
                  onRequestLocationPermission={step.id === 'llamar-112' ? requestLocationPermission : undefined}
                  locationPermissionDenied={step.id === 'llamar-112' ? locationPermissionDenied : undefined}
                />
              </div>
            </ErrorBoundary>
          ))}

          {/* Informational Steps - Secondary Priority */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {steps.filter(step => !step.isEmergency).map((step) => (
              <ErrorBoundary
                key={step.id}
                componentName={`EmergencyStep-${step.id}`}
                showEmergencyInfo={false}
              >
                <EmergencyStep
                  step={step}
                  onToggleInfo={toggleMoreInfo}
                  showMoreInfo={!!showMoreInfo[step.id]}
                />
              </ErrorBoundary>
            ))}
          </div>
        </div>

        <Card className="bg-destructive/10 border-destructive/30 mt-8">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>¡Importante!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-sm leading-relaxed font-medium">
              Este protocolo es una guía de emergencia. Siempre busque atención médica profesional
              en caso de una reacción alérgica grave. No sustituye el consejo médico profesional.
            </p>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
});

EmergencyView.displayName = 'EmergencyView';

export default EmergencyView;
