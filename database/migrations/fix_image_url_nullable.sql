-- Migration: Make image_url nullable for custom questions
-- Custom questions don't require images, so image_url should be nullable

-- Make image_url nullable
ALTER TABLE question_items 
ALTER COLUMN image_url DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'question_items' 
  AND column_name = 'image_url';
