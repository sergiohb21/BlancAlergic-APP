import { LucideIcon, Search, AlertTriangle, FileText } from 'lucide-react';
import card1Image from '/Image/card-1.jpeg';
import card2Image from '/Image/card-2.jpeg';
import card3Image from '/Image/card-3.jpeg';

export interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  imageKey: string;
  buttonText: string;
  buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon: LucideIcon;
  route: string;
  priority: 'high' | 'medium' | 'low';
  isEmergency?: boolean;
  badge?: string;
}

export const features: readonly Feature[] = [
  {
    id: 'verify-food',
    title: 'Verificar Alimentos',
    description: 'Consulta rápidamente si un alimento es seguro para Blanca antes de consumirlo.',
    image: card1Image,
    imageKey: 'card-1',
    buttonText: 'Verificar Alimento',
    buttonVariant: 'default',
    icon: Search,
    route: '/buscarAlergias',
    priority: 'medium'
  },
  {
    id: 'emergency-protocol',
    title: 'Protocolo de Emergencia',
    description: 'Accede rápido al protocolo de actuación en caso de reacción alérgica grave.',
    image: card2Image,
    imageKey: 'card-2',
    buttonText: 'Ver Protocolo',
    buttonVariant: 'destructive',
    icon: AlertTriangle,
    route: '/emergencias',
    priority: 'high',
    isEmergency: true,
    badge: 'Urgente'
  },
  {
    id: 'medical-history',
    title: 'Historial Médico',
    description: 'Revisa el registro completo de alergias con información médica detallada.',
    image: card3Image,
    imageKey: 'card-3',
    buttonText: 'Ver Historial',
    buttonVariant: 'outline',
    icon: FileText,
    route: '/tablaAlergias',
    priority: 'low'
  }
] as const;