-- Find and fix orphan users (users with store_codes that don't exist in stores table)
-- This will automatically create missing stores before adding foreign key

-- Insert missing stores automatically
INSERT INTO stores (store_code, store_name, is_active)
SELECT DISTINCT u.store_code, 'Mağaza ' || u.store_code, true
FROM users u
LEFT JOIN stores s ON u.store_code = s.store_code
WHERE s.store_code IS NULL
ON CONFLICT (store_code) DO NOTHING;

-- Show what was added
SELECT store_code, store_name 
FROM stores 
WHERE store_name LIKE 'Mağaza %'
ORDER BY store_code;
