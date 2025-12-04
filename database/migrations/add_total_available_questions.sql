-- Add total_available_questions column to game_sessions table
-- This stores the total number of questions available in the category when the game started

ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS total_available_questions INTEGER DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN game_sessions.total_available_questions IS 'Total number of active questions available in the category when the game session started';
