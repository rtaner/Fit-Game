-- Add streak columns to game_sessions table for the new scoring system
-- current_streak: Current consecutive correct answers in this session
-- highest_streak: Highest streak achieved in this session

ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_streak INTEGER DEFAULT 0;

-- Add comments to explain the columns
COMMENT ON COLUMN game_sessions.current_streak IS 'Current consecutive correct answers in this game session';
COMMENT ON COLUMN game_sessions.highest_streak IS 'Highest streak achieved in this game session';
