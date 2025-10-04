-- Create restaurant_config table for multi-restaurant support
CREATE TABLE IF NOT EXISTS restaurant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id TEXT UNIQUE NOT NULL DEFAULT 'default',
  
  -- Basic Information
  name TEXT NOT NULL DEFAULT 'Mi Restaurante',
  logo_url TEXT,
  favicon_url TEXT,
  description TEXT,
  
  -- Contact Information
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  
  -- Social Media
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  
  -- Business Hours (JSON format: {"monday": "9:00-22:00", "tuesday": "9:00-22:00", ...})
  business_hours JSONB DEFAULT '{"monday": "9:00-22:00", "tuesday": "9:00-22:00", "wednesday": "9:00-22:00", "thursday": "9:00-22:00", "friday": "9:00-23:00", "saturday": "10:00-23:00", "sunday": "10:00-22:00"}'::jsonb,
  
  -- Branding Colors
  primary_color TEXT DEFAULT '#f97316', -- orange-500
  secondary_color TEXT DEFAULT '#ea580c', -- orange-600
  accent_color TEXT DEFAULT '#fb923c', -- orange-400
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1f2937', -- gray-800
  
  -- Localization
  default_language TEXT DEFAULT 'es',
  supported_languages TEXT[] DEFAULT ARRAY['es', 'en', 'de', 'fr', 'zh'],
  currency TEXT DEFAULT 'EUR',
  currency_symbol TEXT DEFAULT '€',
  
  -- Welcome Message
  welcome_message_es TEXT DEFAULT '¡Bienvenido!',
  welcome_message_en TEXT DEFAULT 'Welcome!',
  welcome_message_de TEXT DEFAULT 'Willkommen!',
  welcome_message_fr TEXT DEFAULT 'Bienvenue!',
  welcome_message_zh TEXT DEFAULT '欢迎!',
  
  -- Features
  enable_ratings BOOLEAN DEFAULT true,
  enable_favorites BOOLEAN DEFAULT true,
  enable_allergen_info BOOLEAN DEFAULT true,
  enable_nutritional_info BOOLEAN DEFAULT false,
  enable_waiter_call BOOLEAN DEFAULT true,
  enable_bill_request BOOLEAN DEFAULT true,
  
  -- WhatsApp Integration
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_phone TEXT,
  
  -- Policies
  terms_url TEXT,
  privacy_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_config_restaurant_id ON restaurant_config(restaurant_id);

-- Insert default configuration with actual app values
INSERT INTO restaurant_config (
  restaurant_id, 
  name, 
  logo_url,
  description,
  primary_color,
  secondary_color,
  accent_color,
  default_language,
  supported_languages,
  currency,
  currency_symbol,
  whatsapp_enabled,
  enable_waiter_call,
  enable_bill_request
)
VALUES (
  'default', 
  'Sabores Caribeños',
  '/LOGO.png',
  'Auténtica cocina caribeña con los mejores sabores del Caribe',
  '#d97706', -- amber-600 (primary color from globals.css)
  '#ec4899', -- pink-500 (secondary color from globals.css)
  '#ec4899', -- pink-500 (accent color from globals.css)
  'es',
  ARRAY['es', 'en', 'de', 'fr', 'zh'],
  'EUR',
  '€',
  true, -- WhatsApp enabled based on NEXT_PUBLIC_WA_ENABLE_ORDER_SEND
  true, -- Waiter call enabled
  true  -- Bill request enabled
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_restaurant_config_updated_at ON restaurant_config;
CREATE TRIGGER trigger_update_restaurant_config_updated_at
  BEFORE UPDATE ON restaurant_config
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_config_updated_at();
