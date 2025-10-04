export interface RestaurantConfig {
  id: string
  restaurant_id: string

  // Basic Information
  name: string
  logo_url?: string
  favicon_url?: string
  description?: string

  // Contact Information
  phone?: string
  email?: string
  address?: string
  website?: string

  // Social Media
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string

  // Business Hours
  business_hours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }

  // Branding Colors
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string

  // Localization
  default_language: string
  supported_languages: string[]
  currency: string
  currency_symbol: string

  // Welcome Messages
  welcome_message_es: string
  welcome_message_en: string
  welcome_message_de: string
  welcome_message_fr: string
  welcome_message_zh: string

  // Features
  enable_ratings: boolean
  enable_favorites: boolean
  enable_allergen_info: boolean
  enable_nutritional_info: boolean
  enable_waiter_call: boolean
  enable_bill_request: boolean

  // WhatsApp Integration
  whatsapp_enabled: boolean
  whatsapp_phone?: string

  // Policies
  terms_url?: string
  privacy_url?: string

  // Metadata
  created_at: string
  updated_at: string
}
