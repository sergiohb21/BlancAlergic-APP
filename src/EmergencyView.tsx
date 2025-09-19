import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Info, Heart } from "lucide-react";
import call112Image from "/Image/call-112.jpg";
import identifySymptomsImage from "/Image/identify-symptoms.png";
import epiPenImage from "/Image/epi-pen.jpg";
import waitHelpImage from "/Image/wait-help.jpg";

interface Step {
  imgPath: string;
  titleText: string;
  infoText: string;
  moreInfo: string;
  buttonAction: () => void;
  buttonText: string;
  icon: React.ReactNode;
}

function EmergencyView(): JSX.Element {
  const [showMoreInfo, setShowMoreInfo] = useState<{ [key: number]: boolean }>(
    {}
  );

  const steps: Step[] = [
    {
      imgPath: call112Image,
      titleText: "Llamar al 112",
      infoText:
        "En caso de una reacción alérgica grave, lo primero que debe hacer es llamar al 112 para solicitar ayuda médica de emergencia.",
      moreInfo:
        "Marcar el 112 conectará directamente con los servicios de emergencia.",
      buttonAction: () => (window.location.href = "tel:112"),
      buttonText: "Llamar",
      icon: <Phone className="h-6 w-6" />,
    },
    {
      imgPath: identifySymptomsImage,
      titleText: "Identificar Síntomas",
      infoText:
        "Revise si la persona tiene síntomas de una reacción alérgica grave, como dificultad para respirar, hinchazón de la cara o labios, o erupciones en la piel.",
      moreInfo:
        "Los síntomas pueden variar, pero incluyen hinchazón, urticaria, dificultad para respirar y anafilaxia.",
      buttonAction: () => toggleMoreInfo(1),
      buttonText: "Más Información",
      icon: <Info className="h-6 w-6" />,
    },
    {
      imgPath: epiPenImage,
      titleText: "Usar EpiPen",
      infoText:
        "Si la persona tiene un EpiPen, administre la inyección de adrenalina en el muslo exterior. Esto puede ayudar a reducir los síntomas mientras espera la llegada de la ayuda médica.",
      moreInfo:
        "Asegúrese de seguir las instrucciones del EpiPen y mantenga la calma.",
      buttonAction: () => toggleMoreInfo(2),
      buttonText: "Más Información",
      icon: <AlertTriangle className="h-6 w-6" />,
    },
    {
      imgPath: waitHelpImage,
      titleText: "Esperar la Ayuda",
      infoText:
        "Mantenga a la persona cómoda y en una posición que facilite la respiración mientras espera la llegada de los servicios de emergencia.",
      moreInfo:
        "Intente mantener a la persona tranquila y vigilada en todo momento.",
      buttonAction: () => toggleMoreInfo(3),
      buttonText: "Más Información",
      icon: <Heart className="h-6 w-6" />,
    },
  ];

  const toggleMoreInfo = (index: number) => {
    setShowMoreInfo((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-destructive">Protocolo de Emergencia Alergénica</h1>
        <p className="text-lg text-muted-foreground">
          Siga estos pasos críticos en caso de una reacción alérgica grave
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {steps.map((step, index) => (
          <div key={index} className="space-y-4">
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
                    />
                  </div>
                  <div className="md:w-2/3 space-y-3">
                    <CardDescription className="text-base leading-relaxed">
                      {step.infoText}
                    </CardDescription>
                    <Button 
                      onClick={step.buttonAction}
                      className="w-full md:w-auto"
                      variant={step.buttonText === "Llamar" ? "destructive" : "default"}
                    >
                      {step.buttonText === "Llamar" && <Phone className="mr-2 h-4 w-4" />}
                      {step.buttonText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {showMoreInfo[index] && (
              <Card className="bg-accent border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-foreground">
                      <p className="font-medium mb-1">Información adicional:</p>
                      <p className="text-sm leading-relaxed">{step.moreInfo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
      
      <Card className="bg-destructive/10 border-destructive/30 mt-8">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>¡Importante!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground text-sm leading-relaxed">
            Este protocolo es una guía de emergencia. Siempre busque atención médica profesional 
            en caso de una reacción alérgica grave. No sustituye el consejo médico profesional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmergencyView;
