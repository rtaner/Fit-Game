-- Update store code range constraint to allow codes up to 1950
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS stores_store_code_check;

ALTER TABLE stores 
  ADD CONSTRAINT stores_store_code_check 
  CHECK (store_code >= 1500 AND store_code <= 1950);
