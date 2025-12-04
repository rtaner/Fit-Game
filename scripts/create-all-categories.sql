-- Create "Tüm Sorular" (All Questions) category
-- This special category includes questions from all active categories

INSERT INTO quiz_categories (
  name,
  description,
  display_order,
  is_active,
  is_quiz_active,
  is_all_categories,
  icon_url
)
VALUES (
  'Tüm Sorular',
  'Tüm aktif kategorilerden karışık sorular',
  999, -- En sonda görünsün
  true,
  true,
  true, -- Bu özel kategori
  'https://res.cloudinary.com/dk5eyiygq/image/upload/v1/all-categories-icon.png'
)
ON CONFLICT DO NOTHING;

-- Verify the category was created
SELECT id, name, is_all_categories, is_quiz_active, is_active 
FROM quiz_categories 
WHERE is_all_categories = true;
