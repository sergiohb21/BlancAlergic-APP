import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Info, Heart } from "lucide-react";
import MedicalErrorBoundary from "@/components/MedicalErrorBoundary";
import { EmergencyTimer } from "@/components/EmergencyTimer";
import { preloadCriticalImages } from "@/lib/image-utils";

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
  showMoreInfo
}: {
  step: Step;
  onToggleInfo: (stepId: string) => void;
  showMoreInfo: boolean;
}) => {
  const handleButtonClick = useCallback(() => {
    if (step.buttonAction) {
      step.buttonAction();
    } else {
      onToggleInfo(step.id);
    }
  }, [step, onToggleInfo]);

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
                    console.log(`✓ Emergency medical image loaded: ${step.id}`);
                  }
                }}
                onError={(error) => {
                  console.error(`❌ Failed to load emergency image: ${step.id}`, error);
                  if (step.isEmergency) {
                    // Track critical medical image failures
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
    prevProps.showMoreInfo === nextProps.showMoreInfo
  );
});

function EmergencyView(): JSX.Element {
  const [showMoreInfo, setShowMoreInfo] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showCallConfirmation, setShowCallConfirmation] = useState(false);

  // Preload critical emergency images on component mount
  useEffect(() => {
    preloadCriticalImages([call112Image, epiPenImage]).catch(console.error);
  }, []);

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
      window.location.href = "tel:112";
    }
  }, [showCallConfirmation]);

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
    <MedicalErrorBoundary componentName="EmergencyView" showEmergencyInfo={true}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Emergency Header with Timer */}
        <div className="text-center mb-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-destructive">Protocolo de Emergencia Alergénica</h1>
            <p className="text-lg text-muted-foreground">
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
            <MedicalErrorBoundary
              key={step.id}
              componentName={`EmergencyStep-${step.id}`}
              showEmergencyInfo={step.id === 'llamar-112'}
            >
              <div className={step.id === 'llamar-112' ? 'border-4 border-destructive/30 rounded-2xl bg-destructive/5 p-6' : ''}>
                <EmergencyStep
                  step={step}
                  onToggleInfo={toggleMoreInfo}
                  showMoreInfo={!!showMoreInfo[step.id]}
                />
              </div>
            </MedicalErrorBoundary>
          ))}

          {/* Informational Steps - Secondary Priority */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {steps.filter(step => !step.isEmergency).map((step) => (
              <MedicalErrorBoundary
                key={step.id}
                componentName={`EmergencyStep-${step.id}`}
                showEmergencyInfo={false}
              >
                <EmergencyStep
                  step={step}
                  onToggleInfo={toggleMoreInfo}
                  showMoreInfo={!!showMoreInfo[step.id]}
                />
              </MedicalErrorBoundary>
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
    </MedicalErrorBoundary>
  );
}

export default EmergencyView;
