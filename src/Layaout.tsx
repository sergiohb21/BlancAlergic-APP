import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CardVideo from "./components/CardImg";
import card1Image from "../dist/Image/card-1.jpeg";
import card2Image from "../dist/Image/card-2.jpeg";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "white">("dark");

  const handleInicio = () => {
    navigate("/BlancAlergic-APP/");
  };

  const handleConsultaAlergias = () => {
    navigate("/BlancAlergic-APP/buscarAlergias");
  };

  const handleEmergencia = () => {
    navigate("/BlancAlergic-APP/emergencias");
  };

  const handleTablaAlergias = () => {
    navigate("/BlancAlergic-APP/tablaAlergias");
  };

  const handlelight_mode = () => {
    document.body.className =
      document.body.className === "dark" ? "white" : "dark";
    setTheme(theme === "dark" ? "white" : "dark");
  };

  const handleShareWhatsApp = () => {
    const message = `🚨 ¡Alerta de Alergias! 🚨
    
  ¡Hey! ¿Sabías que Blanca tiene una app exclusiva para manejar sus alergias? 🌟
  Si alguna vez te has preguntado si esa comida que vas a preparar le hará ver las estrellas 🌟 o visitar el hospital 🚑, ¡esta app es la solución!
  
  🔗 Échale un vistazo aquí: https://sergiohb21.github.io/BlancAlergic-APP/
  
  ¡Comparte y mantén a Blanca libre de sorpresas indeseadas! 🎉`;

    window.open(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  return (
    <>
      <header
        className={`fixed top responsive ${
          theme === "white" ? "dark" : "purple"
        }  white-text`}
      >
        <nav className="fixed top flex space-between align-center padding">
          <h6 className="max">BlancALergias</h6>
          <button className="transparent circle" onClick={handlelight_mode}>
            <i className="right">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </i>
          </button>
        </nav>
      </header>
      <main className="responsive padding-top">
        <div className="responsive">
          {children}
          {location.pathname === "/BlancAlergic-APP/" && (
            <>
              <CardVideo
                imgPath={card1Image}
                titleText="Tabla de Alergias"
                infoText="¿Estás preparando un plato para Blanca y tienes dudas sobre sus alergias? Conoce todas sus alergias con un solo clic y evita cualquier sorpresa indeseada."
                buttonAction={handleTablaAlergias}
                buttonText="Ver Tabla"
              />
              <CardVideo
                imgPath={card2Image}
                titleText="Emergencia"
                infoText="¡Blanca, respira hondo! Si esa comida te ha puesto mal cuerpo, sigue este protocolo y estarás lista para tu próxima aventura culinaria."
                buttonAction={handleEmergencia}
                buttonText="Protocolo de Emergencia"
              />
              <CardVideo
                imgPath={card1Image}
                titleText="Consultar Alergias"
                infoText="¿Estas en un restaurante y te has comido algo que te hace ver estrellas? Averigua si es una alergia o simplemente la magia de la vida diaria."
                buttonAction={handleConsultaAlergias}
                buttonText="Buscar Alergias"
              />
            </>
          )}
        </div>
      </main>
      <nav
        className={`fixed bottom flex justify-around padding ${
          theme === "white" ? "dark" : "purple"
        }  white-text`}
      >
        <a onClick={handleInicio} className="flex flex-column align-center">
          <i className="large">home</i>
          <div>Inicio</div>
        </a>
        <a
          onClick={handleConsultaAlergias}
          className="flex flex-column align-center"
        >
          <i className="large">search</i>
          <div>Alergias</div>
        </a>
        <a
          className="flex flex-column align-center"
          onClick={handleShareWhatsApp}
        >
          <i className="large">share</i>
          <div>Compartir</div>
        </a>
      </nav>
      <footer className="footer bottom-align large-padding text-center">
        &copy; {new Date().getFullYear()} BlancALergias | Todos los derechos
        reservados
      </footer>
    </>
  );
}

export default Layout;
