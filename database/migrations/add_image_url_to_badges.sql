-- Add image_url column to badge_definitions table
-- This allows storing Cloudinary URLs for badge images

-- Add the column if it doesn't exist
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment to the column
COMMENT ON COLUMN badge_definitions.image_url IS 'Cloudinary URL for badge image (optional, falls back to emoji if null)';

-- Create an index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_badge_definitions_image_url 
ON badge_definitions(image_url) 
WHERE image_url IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'badge_definitions'
AND column_name = 'image_url';
