import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Search, AlertTriangle, Table, Share, Download } from 'lucide-react';

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallableState, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Buscar Alergias', href: '/buscarAlergias', icon: Search },
    { name: 'Emergencias', href: '/emergencias', icon: AlertTriangle },
    { name: 'Tabla Alergias', href: '/tablaAlergias', icon: Table },
  ];

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
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">BlancALergias</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareWhatsApp}
            className="text-muted-foreground hover:text-primary"
          >
            <Share className="h-4 w-4" />
          </Button>
          
          {isInstallableState && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInstallClick}
              className="text-muted-foreground hover:text-primary"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menú</h2>
                <ModeToggle />
              </div>
              
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    onClick={() => navigate(item.href)}
                    className="justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
              </nav>

              <div className="border-t pt-4">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="justify-start"
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Compartir en WhatsApp
                  </Button>
                  
                  {isInstallableState && (
                    <Button
                      variant="outline"
                      onClick={handleInstallClick}
                      className="justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
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