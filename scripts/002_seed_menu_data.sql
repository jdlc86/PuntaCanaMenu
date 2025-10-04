-- ============================================
-- DATOS DE EJEMPLO PARA EL MENÚ
-- ============================================

-- Insertar platos destacados
INSERT INTO menu_items (name, category, description, price, allergens, images, is_available, is_featured, display_order)
VALUES 
  (
    'Paella Valenciana',
    'principales',
    'Nuestra especialidad de la casa con arroz, mariscos y azafrán',
    24.50,
    ARRAY['Mariscos', 'Gluten'],
    '[{"url": "/traditional-spanish-paella-valenciana-with-saffron.jpg", "is_primary": true}]'::jsonb,
    true,
    true,
    1
  ),
  (
    'Tostones Rellenos',
    'entrantes',
    'Tostones crujientes rellenos de ropa vieja y queso fundido',
    14.50,
    ARRAY['Lactosa'],
    '[{"url": "/dominican-tostones-rellenos-crispy-plantains.jpg", "is_primary": true}]'::jsonb,
    true,
    true,
    2
  );

-- Insertar otros platos
INSERT INTO menu_items (name, category, description, price, allergens, images, is_available, is_featured, display_order)
VALUES 
  (
    'Jamón Ibérico',
    'entrantes',
    'Jamón ibérico de bellota cortado a mano',
    18.00,
    ARRAY[]::TEXT[],
    '[{"url": "/spanish-iberian-ham-sliced-on-wooden-board.jpg", "is_primary": true}]'::jsonb,
    true,
    false,
    3
  ),
  (
    'Croquetas de Jamón',
    'entrantes',
    'Croquetas caseras de jamón ibérico',
    12.00,
    ARRAY['Gluten', 'Huevos', 'Lactosa'],
    '[{"url": "/golden-spanish-ham-croquettes-on-white-plate.jpg", "is_primary": true}]'::jsonb,
    true,
    false,
    4
  ),
  (
    'Pulpo a la Gallega',
    'principales',
    'Pulpo cocido con pimentón dulce y aceite de oliva',
    22.00,
    ARRAY['Mariscos'],
    '[{"url": "/galician-octopus-with-paprika-on-wooden-plate.jpg", "is_primary": true}]'::jsonb,
    true,
    false,
    5
  ),
  (
    'Crema Catalana',
    'postres',
    'Postre tradicional catalán con azúcar caramelizado',
    8.50,
    ARRAY['Huevos', 'Lactosa'],
    '[{"url": "/catalan-cream-dessert-with-caramelized-sugar-top.jpg", "is_primary": true}]'::jsonb,
    true,
    false,
    6
  ),
  (
    'Sangría',
    'bebidas',
    'Sangría tradicional con frutas frescas',
    16.00,
    ARRAY[]::TEXT[],
    '[{"url": "/spanish-sangria-with-fruits-in-glass-pitcher.jpg", "is_primary": true}]'::jsonb,
    true,
    false,
    7
  );

-- Obtener IDs de los platos insertados para agregar variantes y personalizaciones
DO $$
DECLARE
  paella_id INTEGER;
  tostones_id INTEGER;
  croquetas_id INTEGER;
  sangria_id INTEGER;
BEGIN
  -- Obtener IDs
  SELECT id INTO paella_id FROM menu_items WHERE name = 'Paella Valenciana';
  SELECT id INTO tostones_id FROM menu_items WHERE name = 'Tostones Rellenos';
  SELECT id INTO croquetas_id FROM menu_items WHERE name = 'Croquetas de Jamón';
  SELECT id INTO sangria_id FROM menu_items WHERE name = 'Sangría';

  -- Variantes para Paella Valenciana
  IF paella_id IS NOT NULL THEN
    INSERT INTO menu_item_variants (menu_item_id, name, price_modifier, display_order)
    VALUES 
      (paella_id, 'Individual', NULL, 1),
      (paella_id, 'Para 2 personas', 8.00, 2),
      (paella_id, 'Para 4 personas', 18.00, 3);

    -- Personalizaciones para Paella Valenciana
    INSERT INTO menu_item_personalizations (menu_item_id, name, price, is_free, display_order)
    VALUES 
      (paella_id, 'Extra mariscos', 5.00, false, 1),
      (paella_id, 'Sin azafrán', 0.00, true, 2),
      (paella_id, 'Arroz bomba premium', 3.00, false, 3),
      (paella_id, 'Picante', 0.00, true, 4);
  END IF;

  -- Personalizaciones para Tostones Rellenos
  IF tostones_id IS NOT NULL THEN
    INSERT INTO menu_item_personalizations (menu_item_id, name, price, is_free, display_order)
    VALUES 
      (tostones_id, 'Extra queso', 2.00, false, 1),
      (tostones_id, 'Sin cebolla', 0.00, true, 2);
  END IF;

  -- Variantes para Croquetas de Jamón
  IF croquetas_id IS NOT NULL THEN
    INSERT INTO menu_item_variants (menu_item_id, name, price_modifier, display_order)
    VALUES 
      (croquetas_id, '6 unidades', NULL, 1),
      (croquetas_id, '12 unidades', 8.00, 2);
  END IF;

  -- Variantes para Sangría
  IF sangria_id IS NOT NULL THEN
    INSERT INTO menu_item_variants (menu_item_id, name, price_modifier, display_order)
    VALUES 
      (sangria_id, 'Copa', NULL, 1),
      (sangria_id, 'Jarra (1L)', 12.00, 2);
  END IF;
END $$;
