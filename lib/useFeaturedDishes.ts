import useSWR from "swr"
import type { MenuDish } from "@/types/menu"

const POLL_INTERVAL = 30000 // 30 seconds

async function fetchFeaturedDishes(): Promise<MenuDish[]> {
  try {
    const response = await fetch("/api/menu/featured", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch featured dishes")
    }

    const data = await response.json()
    return data.dishes || []
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch")
    if (isNetworkError) {
      // Silently handle network errors - app is offline
      console.warn("[v0] useFeaturedDishes: Network unavailable, returning empty array")
    } else {
      // Log other errors normally
      console.error("[v0] useFeaturedDishes: Fetch error:", error)
    }
    return [] // Return empty array instead of throwing
  }
}

export function useFeaturedDishes() {
  const { data, error, isLoading, mutate } = useSWR<MenuDish[]>("/api/menu/featured", fetchFeaturedDishes, {
    refreshInterval: POLL_INTERVAL,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    shouldRetryOnError: false,
    errorRetryCount: 2,
  })

  return {
    dishes: data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  }
}
