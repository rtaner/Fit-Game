-- Badge System Tables
-- This creates a flexible, tiered badge system with progress tracking

-- Badge Definitions Table
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'education_lover', 'streak_10'
  name VARCHAR(100) NOT NULL, -- e.g., 'Eğitim Sever', 'İlk Alev'
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'education', 'performance', 'consistency', 'competition', 'secret'
  tier VARCHAR(20), -- 'bronze', 'silver', 'gold', null for single-tier badges
  emoji VARCHAR(10) NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE, -- For secret badges
  unlock_type VARCHAR(50) NOT NULL, -- 'training_time', 'streak', 'total_questions', 'speed', etc.
  unlock_value INTEGER NOT NULL, -- The threshold value
  unlock_metadata JSONB, -- Additional data like category_id for category expert
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badge Progress Table
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code VARCHAR(50) NOT NULL, -- References badge_definitions.code
  current_value INTEGER DEFAULT 0, -- Current progress
  tier_unlocked VARCHAR(20), -- 'bronze', 'silver', 'gold', or null
  unlocked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- Additional tracking data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_code)
);

-- User Statistics Table (for tracking various metrics)
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Training stats
  total_training_time_seconds INTEGER DEFAULT 0,
  
  -- Game stats
  total_questions_answered INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  highest_streak_ever INTEGER DEFAULT 0,
  
  -- Streak stats
  consecutive_zero_score_games INTEGER DEFAULT 0,
  last_game_score INTEGER DEFAULT 0,
  last_game_ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Speed stats
  fastest_average_response_time INTEGER, -- in milliseconds
  
  -- Category performance (JSONB: {category_id: {correct: X, total: Y, accuracy: Z}})
  category_performance JSONB DEFAULT '{}',
  
  -- Store ranking cache
  store_rank INTEGER,
  store_rank_updated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_badge_definitions_category ON badge_definitions(category);
CREATE INDEX idx_badge_definitions_code ON badge_definitions(code);
CREATE INDEX idx_user_badge_progress_user ON user_badge_progress(user_id);
CREATE INDEX idx_user_badge_progress_badge ON user_badge_progress(badge_code);
CREATE INDEX idx_user_statistics_user ON user_statistics(user_id);

-- Comments
COMMENT ON TABLE badge_definitions IS 'Defines all available badges in the system';
COMMENT ON TABLE user_badge_progress IS 'Tracks user progress towards badges';
COMMENT ON TABLE user_statistics IS 'Aggregated user statistics for badge calculations';
