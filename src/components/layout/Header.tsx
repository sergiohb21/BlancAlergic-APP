import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-provider';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Home, Search, AlertTriangle, Table, Share, Download, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '@/utils/logger';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallableState, setIsInstallable] = useState(false);

  useEffect(() => {
    let cleanupTimer: NodeJS.Timeout | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el banner automático del navegador
      e.preventDefault();
      logger.info('beforeinstallprompt event fired - storing for custom prompt');

      // Guardar el evento para mostrar el prompt personalizado más tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Limpiar automáticamente después de 5 minutos si el usuario no interactúa
      cleanupTimer = setTimeout(() => {
        setDeferredPrompt(null);
        setIsInstallable(false);
        logger.info('PWA install prompt expired after 5 minutes');
      }, 5 * 60 * 1000); // 5 minutos
    };

    const handleAppInstalled = () => {
      logger.info('PWA was installed');
      setDeferredPrompt(null);
      setIsInstallable(false);
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
        cleanupTimer = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      logger.warn('No deferred prompt available');
      return;
    }

    try {
      logger.info('Showing PWA install prompt');
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        logger.info('User accepted the A2HS prompt');
      } else {
        logger.info('User dismissed the A2HS prompt');
      }
    } catch (error) {
      logger.error({ error }, 'Error showing PWA install prompt');
    } finally {
      // Limpiar el estado sin importar el resultado
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Buscar Alergias', href: '/buscarAlergias', icon: Search },
    { name: 'Emergencias', href: '/emergencias', icon: AlertTriangle },
    { name: 'Tabla Alergias', href: '/tablaAlergias', icon: Table },
    {
      name: 'Historial Médico',
      href: '/historial-medico',
      icon: Heart,
      isPremium: true,
      badge: user ? null : '🔒'
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      logger.error({ error, userId: user?.uid }, 'Error during logout from header');
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🚨 ¡Alerta de Alergias! 🚨
    
    ¡Hey! ¿Sabías que Blanca tiene una app exclusiva para manejar sus alergias? 🌟
    Si alguna vez te has preguntado si esa comida que vas a preparar le hará ver las estrellas 🌟 o visitar el hospital 🚑, ¡esta app es la solución!
  
    🔗 Échale un vistazo aquí: https://sergiohb21.github.io/BlancAlergic-APP/
  
    ¡Comparte y mantén a Blanca libre de sorpresas indeseadas! 🎉`;

    window.open(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">BlancALergias</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium transition-colors hover:text-primary rounded-md px-2 sm:px-3 py-2 min-h-[44px] ${
                item.isPremium && !user
                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 border border-orange-200 dark:border-orange-800'
                  : isActive(item.href)
                  ? 'text-primary bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted/30 dark:hover:bg-muted/20'
              }`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate max-w-[100px]">{item.name}</span>
              {item.badge && <span className="ml-1">{item.badge}</span>}
              {item.isPremium && user && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 rounded">PRO</span>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-1 sm:space-x-2">
          {user && (
            <div className="hidden xl:flex items-center space-x-2 mr-2">
              <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300 truncate max-w-[120px]">
                Hola, {user.displayName || user.email?.split('@')[0]}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs min-h-[36px] px-2"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareWhatsApp}
            className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] hidden lg:flex"
            aria-label="Compartir en WhatsApp"
          >
            <Share className="h-4 w-4" />
          </Button>

          {isInstallableState && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInstallClick}
              className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] hidden xl:flex"
              aria-label="Instalar aplicación"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          <div className="hidden sm:block">
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden min-h-[44px] min-w-[44px]"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Panel de navegación con acceso a todas las secciones de la aplicación de alergias
            </SheetDescription>
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Menú</h2>
                <ModeToggle />
              </div>

              {user && (
                <div className="flex flex-col space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium dark:text-gray-200">{user.displayName || user.email?.split('@')[0]}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400 truncate">{user.email}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}

              <nav className="flex flex-col space-y-1" role="navigation" aria-label="Navegación principal">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    onClick={() => navigate(item.href)}
                    className={`justify-start h-12 min-h-[44px] ${
                      item.isPremium && !user
                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 border border-orange-200 dark:border-orange-800'
                        : isActive(item.href)
                        ? 'bg-primary dark:bg-primary/80 text-primary-foreground shadow-md dark:shadow-lg'
                        : 'hover:bg-muted/30 dark:hover:bg-muted/20'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && <span className="ml-1">{item.badge}</span>}
                    {item.isPremium && user && (
                      <span className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </Button>
                ))}
              </nav>

              <div className="border-t pt-4">
                <div className="flex flex-col space-y-2">
                  {isInstallableState && (
                    <Button
                      variant="outline"
                      onClick={handleInstallClick}
                      className="justify-start h-12 min-h-[44px]"
                    >
                      <Download className="mr-3 h-4 w-4" />
                      Instalar App
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}