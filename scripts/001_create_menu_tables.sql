-- ============================================
-- SCHEMA PARA MENÚ DE RESTAURANTE
-- ============================================

-- Tabla de platos del menú
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  allergens TEXT[],
  images JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_scheduled BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de variantes de platos
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10, 2),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de personalizaciones de platos
CREATE TABLE IF NOT EXISTS menu_item_personalizations (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_personalizations ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Public read access for menu_items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Public read access for menu_item_variants"
  ON menu_item_variants FOR SELECT
  USING (true);

CREATE POLICY "Public read access for menu_item_personalizations"
  ON menu_item_personalizations FOR SELECT
  USING (true);

-- Políticas de escritura solo para usuarios autenticados
CREATE POLICY "Authenticated users can manage menu_items"
  ON menu_items FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage menu_item_variants"
  ON menu_item_variants FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage menu_item_personalizations"
  ON menu_item_personalizations FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item ON menu_item_variants(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_personalizations_item ON menu_item_personalizations(menu_item_id);
