import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CardVideo from "./components/CardImg";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "white">("dark");

  const handleInicio = () => {
    navigate("/");
  };

  const handleConsultaAlergias = () => {
    navigate("/buscarAlergias");
  };

  const handleEmergencia = () => {
    navigate("/emergencias");
  };

  const handleTablaAlergias = () => {
    navigate("/tablaAlergias");
  };

  const handlelight_mode = () => {
    document.body.className =
      document.body.className === "dark" ? "white" : "dark";
    setTheme(theme === "dark" ? "white" : "dark");
  };

  const handleShareWhatsApp = () => {
    window.open(
      `whatsapp://send?text=${encodeURIComponent(window.location.href)}`
    );
  };

  return (
    <>
      <header
        className={`fixed top responsive ${
          theme === "white" ? "dark" : "purple"
        }  white-text`}
      >
        <nav className="flex space-between align-center padding">
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
          {location.pathname === "/" && (
            <>
              <CardVideo
                imgPath="/img/card-1.jpeg"
                titleText="Tabla de Alergias"
                infoText="Descubre una tabla con todas las alergias de Blanca."
                buttonAction={handleTablaAlergias}
                buttonText="Ver Tabla"
              />
              <CardVideo
                imgPath="/img/card-2.jpeg"
                titleText="Emergencia"
                infoText="¡Blanca, no te preocupes! Si has comido algo que te hace ver estrellas, sigue este protocolo y estarás lista para la próxima aventura."
                buttonAction={handleEmergencia}
                buttonText="Protocolo de Emergencia"
              />
              <CardVideo
                imgPath="/img/card-1.jpeg"
                titleText="Consultar Alergias"
                infoText="Blanca, ¿sientes que un polvito mágico te hace estornudar sin parar? Averigua si es una alergia o simplemente la magia de la vida diaria."
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
