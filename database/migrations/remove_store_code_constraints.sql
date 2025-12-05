-- Remove store code range constraints completely
-- Since we now use dropdown selection, no need for range validation

-- Drop constraint from users table
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_store_code_check;

-- Drop constraint from stores table
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS stores_store_code_check;

-- Store codes can now be any positive integer
-- Validation is handled by dropdown selection in the UI
