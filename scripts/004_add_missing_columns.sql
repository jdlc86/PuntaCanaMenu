-- ============================================
-- MIGRACIÓN: Agregar todas las columnas faltantes
-- ============================================

-- Agregar columna display_order si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN display_order INTEGER DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_menu_items_display_order ON menu_items(display_order);
  END IF;
END $$;

-- Agregar columna is_featured si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN is_featured BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);
  END IF;
END $$;

-- Agregar columna is_available si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'is_available'
  ) THEN
    -- Si existe la columna 'available', renombrarla
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'menu_items' AND column_name = 'available'
    ) THEN
      ALTER TABLE menu_items RENAME COLUMN available TO is_available;
      DROP INDEX IF EXISTS idx_menu_items_available;
    ELSE
      -- Si no existe ninguna, crear is_available
      ALTER TABLE menu_items ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
  END IF;
END $$;

-- Agregar columna is_scheduled si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'is_scheduled'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN is_scheduled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Agregar columnas de horario si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN start_time TIME;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN end_time TIME;
  END IF;
END $$;
