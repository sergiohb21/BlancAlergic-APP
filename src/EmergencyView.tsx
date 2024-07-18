import { useState } from "react";
import CardVideo from "./components/CardImg";
import call112Image from "../dist/Image/call-112.jpg";
import identifySymptomsImage from "../dist/Image/identify-symptoms.png";
import epiPenImage from "../dist/Image/epi-pen.jpg";
import waitHelpImage from "../dist/Image/wait-help.jpg";

interface Step {
  imgPath: string;
  titleText: string;
  infoText: string;
  moreInfo: string;
  buttonAction: () => void;
  buttonText: string;
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
    },
  ];

  const toggleMoreInfo = (index: number) => {
    setShowMoreInfo((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="container">
      {steps.map((step, index) => (
        <div key={index}>
          <CardVideo
            imgPath={step.imgPath}
            titleText={step.titleText}
            infoText={step.infoText}
            buttonAction={step.buttonAction}
            buttonText={step.buttonText}
          />
          {showMoreInfo[index] && (
            <div className="info-box padding">
              <p>{step.moreInfo}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EmergencyView;
