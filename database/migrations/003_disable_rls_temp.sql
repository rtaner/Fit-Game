-- Temporarily disable RLS for development
-- This will be re-enabled with proper policies after auth system is fully implemented

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE answer_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can create user during registration" ON users;
DROP POLICY IF EXISTS "Everyone can view active stores" ON stores;
DROP POLICY IF EXISTS "Only admins can manage stores" ON stores;
DROP POLICY IF EXISTS "Everyone can view active categories" ON quiz_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON quiz_categories;
DROP POLICY IF EXISTS "Everyone can view active questions" ON question_items;
DROP POLICY IF EXISTS "Only admins can manage questions" ON question_items;
DROP POLICY IF EXISTS "Users can view own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can view own analytics" ON answer_analytics;
DROP POLICY IF EXISTS "Users can create own analytics" ON answer_analytics;
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "System can award badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view own reports" ON error_reports;
DROP POLICY IF EXISTS "Users can create reports" ON error_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON error_reports;
