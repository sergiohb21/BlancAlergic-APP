import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CardVideo from "./components/CardVideo";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleInicio = () => {
    navigate("/");
  };

  const handleConsultaAlergias = () => {
    navigate("/buscarAlergias");
  };

  const handleEmergencia = () => {
    navigate("/emergencias");
  };

  return (
    <>
      <nav className="bottom">
        <a onClick={handleInicio} className="left small-margin">
          <i className="large">home</i>
          <div>Inicio</div>
        </a>
        <a onClick={handleConsultaAlergias} className="left small-margin">
          <i className="large">search</i>
          <div>Alergias</div>
        </a>
        <a className="left small-margin">
          <i className="large">share</i>
          <div>Compartir</div>
        </a>
      </nav>
      <main className="responsive">
        <h3 className="large center-align large-margin large-space">
          BlancALergias
        </h3>

        <div className="responsive">
          {children}
          {location.pathname === "/" && (
            <>
              <CardVideo
                videoPath="/assets/video.mp4"
                titleText="Consultar Alergias"
                infoText="Blanca, ¿sientes que un polvito mágico te hace estornudar sin parar? Averigua si es una alergia o simplemente la magia de la vida diaria."
                buttonAction={handleConsultaAlergias}
                buttonText="Buscar Alergias"
              />
              <CardVideo
                videoPath="/assets/video.mp4"
                titleText="Emergencia"
                infoText="¡Blanca, no te preocupes! Si has comido algo que te hace ver estrellas, sigue este protocolo y estarás lista para la próxima aventura."
                buttonAction={handleEmergencia}
                buttonText="Protocolo de Emergencia"
              />
            </>
          )}
        </div>
      </main>
      <footer className="footer bottom-align large-padding">
        &copy; {new Date().getFullYear()} BlancALergias | Todos los derechos
        reservados
      </footer>
    </>
  );
}

export default Layout;
