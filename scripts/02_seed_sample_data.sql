-- ============================================
-- DATOS DE EJEMPLO PARA LA APLICACIÓN
-- ============================================

-- Insertar categorías
INSERT INTO menu_categories (id, name_es, name_en, name_de, name_fr, name_zh, icon, display_order) VALUES
('entrantes', 'Entrantes', 'Starters', 'Vorspeisen', 'Entrées', '开胃菜', '🥗', 1),
('principales', 'Principales', 'Main Courses', 'Hauptgerichte', 'Plats principaux', '主菜', '🍽️', 2),
('postres', 'Postres', 'Desserts', 'Desserts', 'Desserts', '甜点', '🍰', 3),
('bebidas', 'Bebidas', 'Drinks', 'Getränke', 'Boissons', '饮料', '🥤', 4)
ON CONFLICT (id) DO NOTHING;

-- Insertar platos de ejemplo
INSERT INTO menu_items (
  id, category_id, name_es, name_en, name_de, name_fr, name_zh,
  description_es, description_en, description_de, description_fr, description_zh,
  base_price, allergens, main_image, available, schedule_start, schedule_end, display_order
) VALUES
(
  'featured-paella',
  'principales',
  'Paella Valenciana',
  'Valencian Paella',
  'Valencianische Paella',
  'Paella Valencienne',
  '瓦伦西亚海鲜饭',
  'Nuestra especialidad de la casa',
  'Our house specialty',
  'Unsere Hausspezialität',
  'Notre spécialité maison',
  '我们的招牌菜',
  24.50,
  ARRAY['Mariscos', 'Gluten'],
  '/delicious-paella-valenciana-with-saffron-rice-seaf.jpg',
  true,
  '12:00',
  '23:00',
  1
),
(
  'gazpacho',
  'entrantes',
  'Gazpacho Andaluz',
  'Andalusian Gazpacho',
  'Andalusischer Gazpacho',
  'Gaspacho Andalou',
  '安达卢西亚冷汤',
  'Sopa fría tradicional',
  'Traditional cold soup',
  'Traditionelle kalte Suppe',
  'Soupe froide traditionnelle',
  '传统冷汤',
  8.50,
  ARRAY['Gluten'],
  '/placeholder.svg?height=400&width=600',
  true,
  '12:00',
  '23:00',
  1
),
(
  'crema-catalana',
  'postres',
  'Crema Catalana',
  'Catalan Cream',
  'Katalanische Creme',
  'Crème Catalane',
  '加泰罗尼亚奶油',
  'Postre tradicional catalán',
  'Traditional Catalan dessert',
  'Traditionelles katalanisches Dessert',
  'Dessert catalan traditionnel',
  '传统加泰罗尼亚甜点',
  6.50,
  ARRAY['Lácteos', 'Huevo'],
  '/placeholder.svg?height=400&width=600',
  true,
  '12:00',
  '23:00',
  1
)
ON CONFLICT (id) DO NOTHING;

-- Insertar variantes para la paella
INSERT INTO menu_item_variants (menu_item_id, name_es, name_en, name_de, name_fr, name_zh, price_modifier, display_order) VALUES
('featured-paella', 'Individual', 'Individual', 'Einzeln', 'Individuel', '单人份', NULL, 1),
('featured-paella', 'Para 2 personas', 'For 2 people', 'Für 2 Personen', 'Pour 2 personnes', '双人份', 8.00, 2),
('featured-paella', 'Para 4 personas', 'For 4 people', 'Für 4 Personen', 'Pour 4 personnes', '四人份', 20.00, 3)
ON CONFLICT DO NOTHING;

-- Insertar anuncios de ejemplo
INSERT INTO announcements (content_translations, priority, is_active, active_from) VALUES
(
  '{"es": "🎉 ¡Bienvenidos! Disfruta de nuestras especialidades", "en": "🎉 Welcome! Enjoy our specialties", "de": "🎉 Willkommen! Genießen Sie unsere Spezialitäten", "fr": "🎉 Bienvenue ! Profitez de nos spécialités", "zh": "🎉 欢迎！享受我们的特色菜"}',
  10,
  true,
  NOW()
),
(
  '{"es": "✨ Activa la campanita para recibir notificaciones 🔔", "en": "✨ Activate the bell to receive notifications 🔔", "de": "✨ Aktivieren Sie die Glocke für Benachrichtigungen 🔔", "fr": "✨ Activez la cloche pour recevoir des notifications 🔔", "zh": "✨ 开启铃铛接收通知 🔔"}',
  5,
  true,
  NOW()
);
