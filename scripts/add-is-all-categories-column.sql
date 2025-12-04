-- Add is_all_categories column to quiz_categories table
-- This column marks special "All Categories" category that includes questions from all active categories

-- Step 1: Add the column (if it doesn't exist)
ALTER TABLE quiz_categories 
ADD COLUMN IF NOT EXISTS is_all_categories BOOLEAN DEFAULT false;

-- Step 2: Add comment to explain the column
COMMENT ON COLUMN quiz_categories.is_all_categories IS 'Special flag for "All Categories" category that includes questions from all active categories';

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_categories_is_all_categories 
ON quiz_categories(is_all_categories) 
WHERE is_all_categories = true;

-- Step 4: Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_categories' 
AND column_name = 'is_all_categories';
