-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create user during registration" ON users
  FOR INSERT WITH CHECK (true);

-- Stores Policies
CREATE POLICY "Everyone can view active stores" ON stores
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Only admins can manage stores" ON stores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz Categories Policies
CREATE POLICY "Everyone can view active categories" ON quiz_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Only admins can manage categories" ON quiz_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Question Items Policies
CREATE POLICY "Everyone can view active questions" ON question_items
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Only admins can manage questions" ON question_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Game Sessions Policies
CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create own sessions" ON game_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON game_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Answer Analytics Policies
CREATE POLICY "Users can view own analytics" ON answer_analytics
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create own analytics" ON answer_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- User Badges Policies
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Error Reports Policies
CREATE POLICY "Users can view own reports" ON error_reports
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create reports" ON error_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update reports" ON error_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
