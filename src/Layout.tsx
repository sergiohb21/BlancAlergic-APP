import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { FeatureGrid } from './components/features/FeatureGrid';
import { QuickStats } from './components/features/QuickStats';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = React.useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}

          {location.pathname === "/" && (
            <div className="space-y-12">
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Gestión de Alergias
                  <span className="block text-primary">BlancAlergic</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Sistema integral para el monitoreo y gestión de alergias alimentarias.
                  Accede rápido a información crítica y mantén a Blanca segura.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="sr-only">
                  Funciones principales del sistema
                </h2>
                <FeatureGrid onNavigate={handleNavigate} />
              </section>

              {/* Quick Stats Section */}
              <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">
                  Estadísticas del sistema
                </h2>
                <QuickStats />
              </section>
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