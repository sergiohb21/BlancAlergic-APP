import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, AlertTriangle, Share } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  action?: 'share' | string;
}

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Alergias', href: '/buscarAlergias', icon: Search },
    { name: 'Emergencias', href: '/emergencias', icon: AlertTriangle },
    { name: 'Compartir', href: '#', icon: Share, action: 'share' },
  ];

  const handleShareWhatsApp = () => {
    const message = `🚨 ¡Alerta de Alergias! 🚨
    
    ¡Hey! ¿Sabías que Blanca tiene una app exclusiva para manejar sus alergias? 🌟
    Si alguna vez te has preguntado si esa comida que vas a preparar le hará ver las estrellas 🌟 o visitar el hospital 🚑, ¡esta app es la solución!
  
    🔗 Échale un vistazo aquí: https://sergiohb21.github.io/BlancAlergic-APP/
  
    ¡Comparte y mantén a Blanca libre de sorpresas indeseadas! 🎉`;

    window.open(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const handleNavigation = (item: NavigationItem) => {
    if (item.action === 'share') {
      handleShareWhatsApp();
    } else {
      navigate(item.href);
    }
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}