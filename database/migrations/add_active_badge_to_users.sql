-- Add active_badge_id column to users table
-- This allows users to select which badge to display on their profile and leaderboard

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS active_badge_id UUID REFERENCES user_badge_progress(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_active_badge ON users(active_badge_id);

-- Add comment
COMMENT ON COLUMN users.active_badge_id IS 'The badge currently displayed on user profile and leaderboard';
