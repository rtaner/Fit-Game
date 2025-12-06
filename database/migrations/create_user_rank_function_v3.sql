-- Drop old function if exists
DROP FUNCTION IF EXISTS get_user_rank(UUID);

-- Create optimized function to calculate user rankings
-- Fixed type casting issues
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS TABLE (
  global_rank BIGINT,
  local_rank BIGINT,
  total_score BIGINT
) AS $$
DECLARE
  v_user_score BIGINT;
  v_user_store_code VARCHAR;
  v_global_rank BIGINT;
  v_local_rank BIGINT;
BEGIN
  -- Get user's total score and store code
  SELECT 
    COALESCE(SUM(gs.score), 0)::BIGINT,
    u.store_code::VARCHAR
  INTO v_user_score, v_user_store_code
  FROM users u
  LEFT JOIN game_sessions gs ON gs.user_id = u.id AND gs.ended_at IS NOT NULL
  WHERE u.id = p_user_id
  GROUP BY u.id, u.store_code;

  -- If user not found, return zeros
  IF v_user_score IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;

  -- Calculate global rank
  SELECT COUNT(*) + 1
  INTO v_global_rank
  FROM (
    SELECT u.id, COALESCE(SUM(gs.score), 0)::BIGINT as user_total_score
    FROM users u
    LEFT JOIN game_sessions gs ON gs.user_id = u.id AND gs.ended_at IS NOT NULL
    GROUP BY u.id
  ) scores
  WHERE scores.user_total_score > v_user_score;

  -- Calculate local rank (same store)
  SELECT COUNT(*) + 1
  INTO v_local_rank
  FROM (
    SELECT u.id, COALESCE(SUM(gs.score), 0)::BIGINT as user_total_score
    FROM users u
    LEFT JOIN game_sessions gs ON gs.user_id = u.id AND gs.ended_at IS NOT NULL
    WHERE u.store_code::VARCHAR = v_user_store_code
    GROUP BY u.id
  ) scores
  WHERE scores.user_total_score > v_user_score;

  -- Return results
  RETURN QUERY SELECT v_global_rank, v_local_rank, v_user_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_rank(UUID) TO authenticated;

-- Example usage:
-- SELECT * FROM get_user_rank('your-user-uuid-here');
