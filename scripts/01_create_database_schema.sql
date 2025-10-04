-- ============================================
-- SCHEMA COMPLETO PARA APLICACIÓN DE RESTAURANTE
-- ============================================

-- Tabla de categorías del menú
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  name_fr TEXT,
  name_zh TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de platos/productos
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  name_fr TEXT,
  name_zh TEXT,
  description_es TEXT,
  description_en TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_zh TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  allergens TEXT[], -- Array de alérgenos
  main_image TEXT,
  gallery_images TEXT[], -- Array de URLs de imágenes
  available BOOLEAN DEFAULT true,
  schedule_start TIME,
  schedule_end TIME,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de variantes de platos (ej: Individual, Para 2 personas)
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id SERIAL PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  name_fr TEXT,
  name_zh TEXT,
  price_modifier DECIMAL(10, 2), -- NULL significa mismo precio base
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de anuncios
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  content_translations JSONB NOT NULL, -- {"es": "texto", "en": "text", ...}
  priority INTEGER DEFAULT 0,
  active_from TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vista para anuncios visibles actualmente
CREATE OR REPLACE VIEW announcements_visible_now AS
SELECT 
  id,
  content_translations,
  priority,
  updated_at
FROM announcements
WHERE 
  is_active = true
  AND active_from <= NOW()
  AND (active_until IS NULL OR active_until >= NOW());

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para todas las tablas
CREATE POLICY "Public read access for menu_categories"
  ON menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Public read access for menu_items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Public read access for menu_item_variants"
  ON menu_item_variants FOR SELECT
  USING (true);

CREATE POLICY "Public read access for announcements"
  ON announcements FOR SELECT
  USING (true);

-- Políticas de escritura solo para usuarios autenticados
CREATE POLICY "Authenticated users can insert menu_categories"
  ON menu_categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu_categories"
  ON menu_categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu_categories"
  ON menu_categories FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert menu_items"
  ON menu_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu_items"
  ON menu_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu_items"
  ON menu_items FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert menu_item_variants"
  ON menu_item_variants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu_item_variants"
  ON menu_item_variants FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu_item_variants"
  ON menu_item_variants FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update announcements"
  ON announcements FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete announcements"
  ON announcements FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item ON menu_item_variants(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, active_from, active_until);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);
