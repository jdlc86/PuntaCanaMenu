export interface MenuDish {
  id: string
  name: string
  category: string // Made flexible to support any category from backend
  description: string
  price: number
  allergens: string[] // Array of allergen keys from backend
  allergens_other_text?: string // Additional allergen text from backend
  images: string[] | { main: string; gallery?: string[] }
  variants?: Array<{ name: string; price: number | null }>
  personalizations?: Array<{ name: string; price: number; free?: boolean }>
  available?: boolean
  schedule?: { start: string; end: string }
  estrella?: boolean
}

export interface CartItem {
  id: string
  name: string
  category: string
  variantName?: string
  unitPrice: number
  qty: number
  persos: Array<{ name: string; price: number; free?: boolean }>
  img: string
  note?: string
  dish: MenuDish
  quantity: number
  notes?: string
  personalizations?: Array<{ name: string; price: number; free?: boolean }>
}

export interface Dish {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  category: "entrantes" | "principales" | "postres" | "bebidas"
  image: string
  allergens: string[]
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  variants?: {
    sizes?: { name: string; nameEn: string; priceModifier: number }[]
    sides?: { name: string; nameEn: string; priceModifier: number }[]
  }
}

export type OrderType = "R" | "O" | "C" // R=Restaurant, O=Online, C=Camarero
