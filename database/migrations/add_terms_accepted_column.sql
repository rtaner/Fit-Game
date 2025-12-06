-- Add terms_accepted_at column to users table
-- This tracks when users accepted the terms and conditions

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP NULL;

-- Add comment to column
COMMENT ON COLUMN users.terms_accepted_at IS 'Timestamp when user accepted terms and conditions';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_terms_accepted ON users(terms_accepted_at);
