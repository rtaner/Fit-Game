-- Add password reset and force password change fields to users table
-- This enables admin-managed password resets without email/phone verification

-- Add new columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(6) NULL,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_reset_token 
  ON users(reset_token) 
  WHERE reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_force_password 
  ON users(force_password_change) 
  WHERE force_password_change = TRUE;

-- Set default values for existing users
UPDATE users 
SET force_password_change = FALSE 
WHERE force_password_change IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.reset_token IS '6-digit numeric code for password reset, single-use';
COMMENT ON COLUMN users.reset_token_expires IS 'Expiration timestamp for reset token (24 hours from generation)';
COMMENT ON COLUMN users.force_password_change IS 'Flag to force user to change password on next login';
