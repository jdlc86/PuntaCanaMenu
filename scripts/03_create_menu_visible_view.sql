-- ============================================
-- VISTA PARA PLATOS VISIBLES ACTUALMENTE
-- ============================================

-- Vista para platos del menú visibles actualmente
-- Similar a announcements_visible_now pero para menu_items
CREATE OR REPLACE VIEW menu_items_visible_now AS
SELECT 
  mi.id,
  mi.category_id,
  mi.name_es,
  mi.name_en,
  mi.name_de,
  mi.name_fr,
  mi.name_zh,
  mi.description_es,
  mi.description_en,
  mi.description_de,
  mi.description_fr,
  mi.description_zh,
  mi.base_price,
  mi.allergens,
  mi.main_image,
  mi.gallery_images,
  mi.available,
  mi.schedule_start,
  mi.schedule_end,
  mi.display_order,
  mi.updated_at,
  mc.name_es as category_name_es,
  mc.name_en as category_name_en,
  mc.name_de as category_name_de,
  mc.name_fr as category_name_fr,
  mc.name_zh as category_name_zh
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE 
  mi.available = true
  AND (
    mi.schedule_start IS NULL 
    OR mi.schedule_end IS NULL 
    OR (CURRENT_TIME >= mi.schedule_start AND CURRENT_TIME <= mi.schedule_end)
  )
ORDER BY mi.display_order ASC, mi.id ASC;

-- Habilitar Real Time en la tabla menu_items
-- Esto permite que los clientes se suscriban a cambios en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
