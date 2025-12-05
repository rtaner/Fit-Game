-- Add store_manager role to users table
-- This migration adds the 'store_manager' role option to the role column

-- First, check if the role type exists and modify it
DO $$ 
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    END IF;
    
    -- Add new constraint with store_manager role
    ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('employee', 'admin', 'store_manager'));
END $$;

-- Update any existing admin users if needed (optional)
-- UPDATE users SET role = 'store_manager' WHERE id = 'some-user-id';

COMMENT ON COLUMN users.role IS 'User role: employee (regular user), admin (full access), store_manager (analytics access for their store)';
