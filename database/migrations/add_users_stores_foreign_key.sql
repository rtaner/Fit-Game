-- Add foreign key relationship between users and stores
-- This allows Supabase to automatically join tables in queries

-- First, ensure store_code column exists in stores table as unique
-- (it should already be unique, but let's make sure)
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS stores_store_code_key;

ALTER TABLE stores 
  ADD CONSTRAINT stores_store_code_key 
  UNIQUE (store_code);

-- Now add the foreign key constraint
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS fk_users_stores;

ALTER TABLE users 
  ADD CONSTRAINT fk_users_stores 
  FOREIGN KEY (store_code) 
  REFERENCES stores(store_code)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';
