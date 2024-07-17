export interface AlergiaType {
  name: string;
  isAlergic: boolean;
  intensity: string;
  category: string;
  KUA_Litro?: number;
}
export const arrayAlergias: AlergiaType[] = [
  {
    name: "Gamba",
    isAlergic: true,
    intensity: "Alta",
    category: "Crustaceos",
    KUA_Litro: 1.36,
  },
  {
    name: "Almeja",
    isAlergic: false,
    intensity: "Baja",
    category: "Mariscos",
    KUA_Litro: 0.04,
  },
  {
    name: "Mejillón",
    isAlergic: false,
    intensity: "Baja",
    category: "Mariscos",
    KUA_Litro: 0.01,
  },
  {
    name: "Atún",
    isAlergic: false,
    intensity: "Baja",
    category: "Pescados",
    KUA_Litro: 0.11,
  },
  {
    name: "Calamar",
    isAlergic: false,
    intensity: "Baja",
    category: "Mariscos",
    KUA_Litro: 0.02,
  },
  {
    name: "Bacalao",
    isAlergic: false,
    intensity: "Baja",
    category: "Pescados",
    KUA_Litro: 0.01,
  },
  {
    name: "Merluza",
    isAlergic: false,
    intensity: "Baja",
    category: "Pescados",
    KUA_Litro: 0.02,
  },
  {
    name: "Gallo",
    isAlergic: false,
    intensity: "Baja",
    category: "Pescados",
    KUA_Litro: 0.03,
  },
  {
    name: "Salmón",
    isAlergic: false,
    intensity: "Baja",
    category: "Pescados",
    KUA_Litro: 0.01,
  },
  {
    name: "Tomate",
    isAlergic: true,
    intensity: "Media",
    category: "Vegetales",
    KUA_Litro: 0.1,
  },
  {
    name: "Melocotón",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutas",
    KUA_Litro: 13.2,
  },
  {
    name: "Calabaza",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 2.94,
  },
  {
    name: "Cacahuete",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutos secos",
    KUA_Litro: 4.96,
  },
  {
    name: "Avellana",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutos secos",
    KUA_Litro: 1.83,
  },
  {
    name: "Nuez",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutos secos",
    KUA_Litro: 7.2,
  },

  {
    name: "Almendra",
    isAlergic: true,
    intensity: "Media",
    category: "Frutos secos",
    KUA_Litro: 2.64,
  },
  {
    name: "Piñón",
    isAlergic: false,
    intensity: "Baja",
    category: "Frutos secos",
    KUA_Litro: 0.24,
  },
  {
    name: "Anacardo",
    isAlergic: false,
    intensity: "Baja",
    category: "Frutos secos",
    KUA_Litro: 0.01,
  },
  {
    name: "Pistacho",
    isAlergic: false,
    intensity: "Baja",
    category: "Frutos secos",
    KUA_Litro: 0.05,
  },
  {
    name: "Cipres",
    isAlergic: true,
    intensity: "Alta",
    category: "Árboles",
    KUA_Litro: 22.7,
  },
  {
    name: "Calabacin",
    isAlergic: true,
    intensity: "Alta",
    category: "vegetales",
    KUA_Litro: 7.00,
  },
  {
    name:"Pimiento rojo",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Fresa",
    isAlergic: true,
    intensity: "Alta",
    category: "Frutas",
    KUA_Litro: 5.00,
  },
  {
    name:"Aguacate",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Berenjena",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Piña",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Melón",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Paraguaya",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 14.00,
  },
  {
    name:"Pepino",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Pimiento verde",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 5.00,
  },
  {
    name:"Calabaza",
    isAlergic: true,
    intensity: "Alta",
    category: "Vegetales",
    KUA_Litro: 4.00,
  },
  {
    name: "Hierba timonía",
    isAlergic: true,
    intensity: "Alta",
    category: "Árboles",
    KUA_Litro: 8.24,
  },
  {
    name: "Plátano de sombra",
    isAlergic: true,
    intensity: "Alta",
    category: "Árboles",
    KUA_Litro: 9.09,
  },
  {
    name: "Arizónica",
    isAlergic: true,
    intensity: "Alta",
    category: "Árboles",
    KUA_Litro: 16.2,
  },
  {
    name: "Alternaria alternata",
    isAlergic: true,
    intensity: "Alta",
    category: "Hongos",
    KUA_Litro: 10.2,
  },
  {
    name: "Perro",
    isAlergic: true,
    intensity: "Media",
    category: "Animales",
    KUA_Litro: 3.69,
  },
  {
    name: "Gato ",
    isAlergic: true,
    intensity: "Alta",
    category: "Animales",
    KUA_Litro: 16.9,
  },
];
