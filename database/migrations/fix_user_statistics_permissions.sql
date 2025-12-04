-- Fix permissions for user_statistics table
-- Grant all permissions to authenticated users and service role

-- Grant permissions on user_statistics
GRANT ALL ON user_statistics TO authenticated;
GRANT ALL ON user_statistics TO anon;
GRANT ALL ON user_statistics TO service_role;

-- Also grant usage on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
