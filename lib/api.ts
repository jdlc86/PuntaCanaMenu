import type { MenuDish } from "../types/menu"
// Importing centralized menu data instead of local mockDishes
import { menuData } from "@/data/menu"

const isProduction = process.env.NODE_ENV === "production"
const BASE_URL = typeof window !== "undefined" ? window.location.origin : ""

export async function fetchMenu(): Promise<MenuDish[]> {
  if (isProduction && typeof window !== "undefined") {
    try {
      const response = await fetch(`${BASE_URL}/api/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          function: "getPublicMenu",
          parameters: [],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching menu from API, falling back to mock data:", error)
      // Using centralized menuData instead of local mockDishes
      return menuData
    }
  }

  // Using centralized menuData instead of local mockDishes
  return menuData
}

export async function createOrder(payload: {
  orderId?: string
  cart: Array<{
    id: string
    v?: string
    q: number
    p: [string, number][]
    note?: string
    variant?: string
    personalizations?: any
  }>
  totalClient: number
  tip?: number
  itemNotes?: Record<string, string>
  meta?: any
}) {
  try {
    console.log("[v0] createOrder: Starting order creation")
    console.log("[v0] createOrder: Payload:", JSON.stringify(payload, null, 2))

    const token = sessionStorage.getItem("table_token")
    const orderType = sessionStorage.getItem("order_type")

    console.log(
      "[v0] createOrder: Token from sessionStorage:",
      token ? "present (length: " + token.length + ")" : "missing",
    )
    console.log("[v0] createOrder: Order type from sessionStorage:", orderType)
    console.log("[v0] createOrder: NEXT_PUBLIC_REQUIRE_JWT:", process.env.NEXT_PUBLIC_REQUIRE_JWT)

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log("[v0] createOrder: Added Authorization header with Bearer token")
    } else {
      console.warn("[v0] createOrder: No token found in sessionStorage - request will be unauthenticated")
    }

    const BASE_URL = typeof window !== "undefined" ? window.location.origin : ""

    console.log("[v0] createOrder: Calling API endpoint:", `${BASE_URL}/api/orders`)
    console.log("[v0] createOrder: Request headers:", JSON.stringify(headers, null, 2))

    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        function: "createOrder",
        parameters: [payload],
      }),
    })

    console.log("[v0] createOrder: API response status:", response.status)
    console.log(
      "[v0] createOrder: API response headers:",
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2),
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] createOrder: API error response:", errorText)

      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error) {
          errorMessage = errorData.error
        }
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`
        }
        console.error("[v0] createOrder: Parsed error data:", errorData)
      } catch (e) {
        console.error("[v0] createOrder: Could not parse error response as JSON")
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] createOrder: API response data:", JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error("[v0] createOrder: Exception occurred:", error)
    console.error("[v0] createOrder: Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Return error instead of fallback
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error creating order",
    }
  }
}

export function getTableFromUrl(): string {
  if (typeof window !== "undefined") {
    // Try to get from URL parameters first
    const urlParams = new URLSearchParams(window.location.search)
    const tableFromUrl = urlParams.get("mesa") || urlParams.get("table")
    if (tableFromUrl) return tableFromUrl

    // Try to get from global variable injected by GAS template
    // @ts-ignore - mesa is injected by GAS template
    if (window.mesa) return window.mesa

    // Fallback for development
    return "1"
  }
  return ""
}
