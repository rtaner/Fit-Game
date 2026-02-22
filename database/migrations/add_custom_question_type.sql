-- Migration: Add custom question type support
-- This adds new columns to support manual question/answer format
-- Safe: Does not modify existing data, only adds new optional columns

-- Add question_type column (default 'fit' for backward compatibility)
ALTER TABLE question_items 
ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) DEFAULT 'fit' CHECK (question_type IN ('fit', 'custom'));

-- Add custom question text (for custom type questions)
ALTER TABLE question_items 
ADD COLUMN IF NOT EXISTS custom_question_text TEXT;

-- Add custom options as JSON array
-- Format: [{"id": "A", "text": "Option A", "isCorrect": false}, ...]
ALTER TABLE question_items 
ADD COLUMN IF NOT EXISTS custom_options JSONB;

-- Add comment for documentation
COMMENT ON COLUMN question_items.question_type IS 'Type of question: fit (auto-generated options) or custom (manual options)';
COMMENT ON COLUMN question_items.custom_question_text IS 'Question text for custom type questions';
COMMENT ON COLUMN question_items.custom_options IS 'JSON array of options for custom questions: [{"id": "A", "text": "...", "isCorrect": true/false}]';

-- Create index for question_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_question_items_question_type ON question_items(question_type);

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'question_items' 
  AND column_name IN ('question_type', 'custom_question_text', 'custom_options')
ORDER BY column_name;
