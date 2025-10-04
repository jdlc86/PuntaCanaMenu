"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRestaurantConfig } from "@/lib/useRestaurantConfig"
import type { RestaurantConfig } from "@/types/restaurant-config"

interface RestaurantConfigContextType {
  config: RestaurantConfig | null
  isLoading: boolean
  isError: boolean
}

const RestaurantConfigContext = createContext<RestaurantConfigContextType | undefined>(undefined)

export function RestaurantConfigProvider({ children }: { children: ReactNode }) {
  const { config, isLoading, isError } = useRestaurantConfig()

  return (
    <RestaurantConfigContext.Provider value={{ config, isLoading, isError }}>
      {children}
    </RestaurantConfigContext.Provider>
  )
}

export function useRestaurantConfigContext() {
  const context = useContext(RestaurantConfigContext)
  if (context === undefined) {
    throw new Error("useRestaurantConfigContext must be used within a RestaurantConfigProvider")
  }
  return context
}
