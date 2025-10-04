import useSWR from "swr"
import type { RestaurantConfig } from "@/types/restaurant-config"

interface RestaurantConfigResponse {
  ok: boolean
  config?: RestaurantConfig
  error?: string
}

const DEFAULT_CONFIG: RestaurantConfig = {
  restaurant_id: "default",
  name: "Sabores Caribeños",
  description: "Auténtica cocina caribeña con los mejores sabores del trópico",
  logo_url: "/LOGO.png",
  primary_color: "#d97706", // amber-600
  secondary_color: "#ec4899", // pink-500
  accent_color: "#f59e0b", // amber-500
  phone: process.env.NEXT_PUBLIC_WA_PHONE || "",
  email: "info@saborescaribenos.com",
  address: "",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  whatsapp_number: process.env.NEXT_PUBLIC_WA_PHONE || "",
  default_language: "es",
  currency: "EUR",
  currency_symbol: "€",
  timezone: "Europe/Madrid",
  opening_hours: "10:00",
  closing_hours: "23:00",
  welcome_message_es: "¡Bienvenido a Sabores Caribeños!",
  welcome_message_en: "Welcome to Sabores Caribeños!",
  welcome_message_de: "Willkommen bei Sabores Caribeños!",
  welcome_message_fr: "Bienvenue chez Sabores Caribeños!",
  welcome_message_zh: "欢迎来到 Sabores Caribeños！",
  goodbye_message_es: "¡Gracias por tu visita!",
  goodbye_message_en: "Thank you for your visit!",
  goodbye_message_de: "Danke für Ihren Besuch!",
  goodbye_message_fr: "Merci de votre visite!",
  goodbye_message_zh: "感谢您的光临！",
  enable_online_ordering: true,
  enable_reservations: false,
  enable_tips: true,
  enable_ratings: true,
  enable_waiter_call: process.env.NEXT_PUBLIC_WA_ENABLE_DISH_INFO === "true",
  enable_bill_request: process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND === "true",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const fetcher = async (url: string): Promise<RestaurantConfig> => {
  console.log("[v0] useRestaurantConfig: Fetching from:", url)

  const response = await fetch(url)
  const data: RestaurantConfigResponse = await response.json()

  console.log("[v0] useRestaurantConfig: Response:", { ok: data.ok, hasConfig: !!data.config, error: data.error })

  if (!data.ok || !data.config) {
    console.warn("[v0] useRestaurantConfig: Failed to fetch config, using defaults")
    return DEFAULT_CONFIG
  }

  console.log("[v0] useRestaurantConfig: Config loaded successfully")
  return data.config
}

export function useRestaurantConfig(restaurantId = "default") {
  const { data, error, isLoading, mutate } = useSWR<RestaurantConfig>(
    `/api/restaurant-config?restaurant_id=${restaurantId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      fallbackData: DEFAULT_CONFIG,
    },
  )

  return {
    config: data || DEFAULT_CONFIG,
    isLoading,
    isError: error,
    mutate,
  }
}
