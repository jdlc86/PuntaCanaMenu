import type { MenuDish } from "@/types/menu"

export const menuData: MenuDish[] = [
  {
    id: "featured-paella",
    name: "Paella Valenciana",
    category: "principales",
    description: "Nuestra especialidad de la casa",
    price: 24.5,
    allergens: ["Mariscos", "Gluten"],
    images: {
      main: "/delicious-paella-valenciana-with-saffron-rice-seaf.jpg",
      gallery: ["/delicious-paella-valenciana-with-saffron-rice-seaf.jpg"],
    },
    available: true,
    schedule: { start: "12:00", end: "23:00" },
    variants: [
      { name: "Individual", price: null },
      { name: "Para 2 personas", price: 8.0 },
      { name: "Para 4 personas", price: 18.0 },
    ],
    personalizations: [
      { name: "Extra mariscos", price: 5.0 },
      { name: "Sin azafrán", price: 0, free: true },
      { name: "Arroz bomba premium", price: 3.0 },
      { name: "Picante", price: 0, free: true },
    ],
    estrella: true,
  },
  {
    id: "1",
    name: "Tostones Rellenos",
    category: "entrantes",
    description: "Tostones crujientes rellenos de ropa vieja y queso fundido",
    price: 14.5,
    allergens: ["lactosa"],
    images: {
      main: "/dominican-tostones-rellenos-crispy-plantains.jpg",
      gallery: [
        "/dominican-tostones-rellenos-crispy-plantains.jpg",
        "/placeholder-qne19.png",
        "/placeholder-cvoq2.png",
      ],
    },
    personalizations: [
      { name: "Extra queso", price: 2.0 },
      { name: "Sin cebolla", price: 0, free: true },
    ],
    estrella: true,
  },
  {
    id: "2",
    name: "Jamón Ibérico",
    category: "entrantes",
    description: "Jamón ibérico de bellota cortado a mano",
    price: 18.0,
    allergens: [],
    images: {
      main: "/spanish-iberian-ham-sliced-on-wooden-board.jpg",
      gallery: ["/spanish-iberian-ham-sliced-on-wooden-board.jpg"],
    },
  },
  {
    id: "3",
    name: "Croquetas de Jamón",
    category: "entrantes",
    description: "Croquetas caseras de jamón ibérico",
    price: 12.0,
    allergens: ["Gluten", "Huevos", "Lactosa"],
    images: {
      main: "/golden-spanish-ham-croquettes-on-white-plate.jpg",
      gallery: ["/golden-spanish-ham-croquettes-on-white-plate.jpg"],
    },
    variants: [
      { name: "6 unidades", price: null },
      { name: "12 unidades", price: 8.0 },
    ],
  },
  {
    id: "4",
    name: "Pulpo a la Gallega",
    category: "principales",
    description: "Pulpo cocido con pimentón dulce y aceite de oliva",
    price: 22.0,
    allergens: ["Mariscos"],
    images: {
      main: "/galician-octopus-with-paprika-on-wooden-plate.jpg",
      gallery: ["/galician-octopus-with-paprika-on-wooden-plate.jpg"],
    },
  },
  {
    id: "5",
    name: "Crema Catalana",
    category: "postres",
    description: "Postre tradicional catalán con azúcar caramelizado",
    price: 8.5,
    allergens: ["Huevos", "Lactosa"],
    images: {
      main: "/catalan-cream-dessert-with-caramelized-sugar-top.jpg",
      gallery: ["/catalan-cream-dessert-with-caramelized-sugar-top.jpg"],
    },
  },
  {
    id: "6",
    name: "Sangría",
    category: "bebidas",
    description: "Sangría tradicional con frutas frescas",
    price: 16.0,
    allergens: [],
    images: {
      main: "/spanish-sangria-with-fruits-in-glass-pitcher.jpg",
      gallery: ["/spanish-sangria-with-fruits-in-glass-pitcher.jpg"],
    },
    variants: [
      { name: "Copa", price: null },
      { name: "Jarra (1L)", price: 12.0 },
    ],
  },
]
