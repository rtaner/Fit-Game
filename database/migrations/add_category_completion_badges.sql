-- Add category completion badges to badge_definitions table

-- Denim Fit Ustası
INSERT INTO badge_definitions (
  code,
  name,
  description,
  category,
  tier,
  emoji,
  image_url,
  is_hidden,
  unlock_type,
  unlock_value,
  unlock_metadata,
  display_order
) VALUES (
  'category_denim_fit',
  'Denim Fit Ustası',
  'Denim Fit kategorisindeki tüm soruları tamamladınız!',
  'category_completion',
  'unlocked',
  '👖',
  NULL,
  false,
  'category_completion',
  1,
  '{"category": "denim-fit"}',
  100
) ON CONFLICT (code) DO NOTHING;

-- Denim Şort Uzmanı
INSERT INTO badge_definitions (
  code,
  name,
  description,
  category,
  tier,
  emoji,
  image_url,
  is_hidden,
  unlock_type,
  unlock_value,
  unlock_metadata,
  display_order
) VALUES (
  'category_denim_short',
  'Denim Şort Uzmanı',
  'Denim Şort kategorisindeki tüm soruları tamamladınız!',
  'category_completion',
  'unlocked',
  '🩳',
  NULL,
  false,
  'category_completion',
  1,
  '{"category": "denim-sort"}',
  101
) ON CONFLICT (code) DO NOTHING;

-- Koleksiyon Bilgini
INSERT INTO badge_definitions (
  code,
  name,
  description,
  category,
  tier,
  emoji,
  image_url,
  is_hidden,
  unlock_type,
  unlock_value,
  unlock_metadata,
  display_order
) VALUES (
  'category_collections',
  'Koleksiyon Bilgini',
  'Koleksiyonlar kategorisindeki tüm soruları tamamladınız!',
  'category_completion',
  'unlocked',
  '🎨',
  NULL,
  false,
  'category_completion',
  1,
  '{"category": "koleksiyonlar"}',
  102
) ON CONFLICT (code) DO NOTHING;

-- Prosedür Profesyoneli
INSERT INTO badge_definitions (
  code,
  name,
  description,
  category,
  tier,
  emoji,
  image_url,
  is_hidden,
  unlock_type,
  unlock_value,
  unlock_metadata,
  display_order
) VALUES (
  'category_procedures',
  'Prosedür Profesyoneli',
  'Prosedürler kategorisindeki tüm soruları tamamladınız!',
  'category_completion',
  'unlocked',
  '📋',
  NULL,
  false,
  'category_completion',
  1,
  '{"category": "prosedurler"}',
  103
) ON CONFLICT (code) DO NOTHING;

-- Tüm Kategoriler Şampiyonu
INSERT INTO badge_definitions (
  code,
  name,
  description,
  category,
  tier,
  emoji,
  image_url,
  is_hidden,
  unlock_type,
  unlock_value,
  unlock_metadata,
  display_order
) VALUES (
  'category_all_champion',
  'Tüm Kategoriler Şampiyonu',
  'Tüm Kategoriler modunda tüm soruları tamamladınız!',
  'category_completion',
  'unlocked',
  '🏆',
  NULL,
  false,
  'category_completion',
  1,
  '{"category": "all-categories"}',
  104
) ON CONFLICT (code) DO NOTHING;
