import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Table, Search, AlertTriangle } from 'lucide-react';
import card1Image from '/Image/card-1.jpeg';
import card2Image from '/Image/card-2.jpeg';
import card3Image from '/Image/card-3.jpeg';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const featureCards = [
    {
      image: card3Image,
      title: "Tabla de Alergias",
      description: "Conoce todas sus alergias con un solo clic y evita cualquier sorpresa indeseada.",
      action: () => navigate("/tablaAlergias"),
      buttonText: "Ver Tabla",
      icon: Table
    },
    {
      image: card2Image,
      title: "Emergencia",
      description: "¡Blanca, respira hondo! Si esa comida te ha puesto mal cuerpo, sigue este protocolo y estarás lista para tu próxima aventura culinaria.",
      action: () => navigate("/emergencias"),
      buttonText: "Protocolo de Emergencia",
      icon: AlertTriangle
    },
    {
      image: card1Image,
      title: "Consultar Alergias",
      description: "¿Estas en un restaurante y te has comido algo que te hace ver estrellas? Averigua si es una alergia o simplemente la magia de la vida diaria.",
      action: () => navigate("/buscarAlergias"),
      buttonText: "Buscar Alergias",
      icon: Search
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
          
          {location.pathname === "/" && (
            <div className="space-y-8">
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCards.map((card, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <card.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={card.action}
                        className="w-full"
                        size="lg"
                      >
                        {card.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-primary">29+</div>
                  <div className="text-sm text-muted-foreground">Alergias Registradas</div>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-primary">9</div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNavigation />
    </div>
  );
}

export default Layout;