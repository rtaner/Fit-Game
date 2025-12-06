-- Create function to calculate user rankings efficiently
-- This replaces the slow N+1 query pattern with a single optimized query

CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS TABLE (
  global_rank BIGINT,
  local_rank BIGINT,
  total_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    -- Calculate total score for each user
    SELECT 
      u.id,
      u.store_code,
      COALESCE(SUM(gs.score), 0) as total_score
    FROM users u
    LEFT JOIN game_sessions gs ON gs.user_id = u.id AND gs.ended_at IS NOT NULL
    GROUP BY u.id, u.store_code
  ),
  user_data AS (
    -- Get the target user's data
    SELECT * FROM user_scores WHERE id = p_user_id
  )
  SELECT 
    -- Global rank: count users with higher score + 1
    (SELECT COUNT(*) + 1 
     FROM user_scores 
     WHERE total_score > (SELECT total_score FROM user_data))::BIGINT as global_rank,
    
    -- Local rank: count users in same store with higher score + 1
    (SELECT COUNT(*) + 1 
     FROM user_scores 
     WHERE store_code = (SELECT store_code FROM user_data) 
     AND total_score > (SELECT total_score FROM user_data))::BIGINT as local_rank,
    
    -- User's total score
    (SELECT total_score FROM user_data)::BIGINT as total_score;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_rank(UUID) TO authenticated;

-- Example usage:
-- SELECT * FROM get_user_rank('user-uuid-here');
