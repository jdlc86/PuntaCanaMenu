"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, MenuDish } from "@/types/menu"

interface CartContextType {
  cart: CartItem[]
  addToCart: (
    dish: MenuDish,
    quantity?: number,
    variant?: string,
    personalizations?: Array<{ name: string; price: number; free?: boolean }>,
    notes?: string,
  ) => void
  updateQuantity: (index: number, newQuantity: number) => void
  removeItem: (index: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("restaurant-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (
    dish: MenuDish,
    quantity = 1,
    variant?: string,
    personalizations: Array<{ name: string; price: number; free?: boolean }> = [],
    notes?: string,
  ) => {
    const basePrice = typeof dish.price === "number" && !isNaN(dish.price) ? dish.price : 0
    const variantPrice = variant && dish.variants ? dish.variants.find((v) => v.name === variant)?.price || 0 : 0
    const persosPrice = personalizations.reduce((sum, p) => {
      const price = typeof p.price === "number" && !isNaN(p.price) ? p.price : 0
      return sum + (p.free ? 0 : price)
    }, 0)
    const unitPrice = basePrice + variantPrice + persosPrice

    const cartItem: CartItem = {
      id: dish.id,
      name: dish.name,
      category: dish.category,
      variantName: variant,
      unitPrice,
      qty: quantity,
      persos: personalizations,
      img: Array.isArray(dish.images) ? dish.images[0] : dish.images.main,
      note: notes,
      dish: dish,
      quantity: quantity,
      notes: notes,
      personalizations: personalizations,
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === dish.id &&
          item.variantName === variant &&
          JSON.stringify(item.persos) === JSON.stringify(personalizations) &&
          item.note === notes,
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].qty += quantity
        updated[existingIndex].quantity = updated[existingIndex].qty
        return updated
      } else {
        return [...prev, cartItem]
      }
    })
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    setCart((prev) => {
      const updated = [...prev]
      updated[index].qty = newQuantity
      return updated
    })
  }

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => {
    const qty = typeof item.qty === "number" && !isNaN(item.qty) ? item.qty : 0
    return total + qty
  }, 0)

  const subtotal = cart.reduce((total, item) => {
    const unitPrice = typeof item.unitPrice === "number" && !isNaN(item.unitPrice) ? item.unitPrice : 0
    const qty = typeof item.qty === "number" && !isNaN(item.qty) ? item.qty : 0
    return total + unitPrice * qty
  }, 0)

  const value: CartContextType = {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    setCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
