export interface AlergiaType {
  name: string;
  isAlergic: boolean;
  intensity: string;
  category: string;
}
export const arrayAlergias: AlergiaType[] = [
  {
    name: "Cacahuete",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutos Secos",
  },
  {
    name: "Almendra",
    isAlergic: false,
    intensity: "Baja",
    category: "Frutos Secos",
  },
  {
    name: "Nuez",
    isAlergic: true,
    intensity: "Media",
    category: "Frutos Secos",
  },
  {
    name: "Pistacho",
    isAlergic: false,
    intensity: "Baja",
    category: "Frutos Secos",
  },
  {
    name: "Avellana",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutos Secos",
  },
  {
    name: "Nuez De Brasil",
    isAlergic: true,
    intensity: "Media",
    category: "Frutos Secos",
  },
  { name: "Camarón", isAlergic: true, intensity: "Alta", category: "Mariscos" },
  {
    name: "Mejillón",
    isAlergic: false,
    intensity: "Baja",
    category: "Mariscos",
  },
  { name: "Ostras", isAlergic: true, intensity: "Media", category: "Mariscos" },
  { name: "Vieira", isAlergic: false, intensity: "Baja", category: "Mariscos" },
  {
    name: "Calamar",
    isAlergic: true,
    intensity: "Media",
    category: "Mariscos",
  },
];
