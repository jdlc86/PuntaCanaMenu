-- ============================================
-- MIGRACIÓN: Agregar columna is_featured
-- ============================================

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

-- Agregar columna is_available si no existe (renombrar available)
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
    ELSE
      -- Si no existe ninguna, crear is_available
      ALTER TABLE menu_items ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    -- Recrear el índice con el nuevo nombre
    DROP INDEX IF EXISTS idx_menu_items_available;
    CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
  END IF;
END $$;

-- Marcar algunos platos como destacados (opcional)
-- Puedes descomentar esto si quieres marcar platos específicos como destacados
-- UPDATE menu_items SET is_featured = true WHERE id IN ('paella-valenciana', 'jamon-iberico');
