-- Make city and region columns nullable in stores table
ALTER TABLE stores 
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN region DROP NOT NULL;

-- Update existing records with NULL values if they have empty strings
UPDATE stores 
SET 
  city = NULL 
WHERE city = '';

UPDATE stores 
SET 
  region = NULL 
WHERE region = '';
