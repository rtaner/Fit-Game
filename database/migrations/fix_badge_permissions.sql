-- Fix permissions for badge tables
-- Grant all permissions to authenticated users

-- Grant permissions on badge_definitions
GRANT ALL ON badge_definitions TO authenticated;
GRANT ALL ON badge_definitions TO anon;
GRANT ALL ON badge_definitions TO service_role;

-- Grant permissions on user_badge_progress
GRANT ALL ON user_badge_progress TO authenticated;
GRANT ALL ON user_badge_progress TO anon;
GRANT ALL ON user_badge_progress TO service_role;

-- Also grant usage on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
