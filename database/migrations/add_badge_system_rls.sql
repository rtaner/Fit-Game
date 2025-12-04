-- Enable RLS on badge system tables
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Badge Definitions Policies
-- Everyone can view badge definitions
CREATE POLICY "Everyone can view badge definitions" ON badge_definitions
  FOR SELECT USING (true);

-- Only admins can manage badge definitions
CREATE POLICY "Only admins can manage badge definitions" ON badge_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- User Badge Progress Policies
-- Users can view own badge progress
CREATE POLICY "Users can view own badge progress" ON user_badge_progress
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- System can create badge progress (for awarding badges)
CREATE POLICY "System can create badge progress" ON user_badge_progress
  FOR INSERT WITH CHECK (true);

-- System can update badge progress
CREATE POLICY "System can update badge progress" ON user_badge_progress
  FOR UPDATE USING (true);

-- User Statistics Policies
-- Users can view own statistics
CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- System can create user statistics
CREATE POLICY "System can create user statistics" ON user_statistics
  FOR INSERT WITH CHECK (true);

-- System can update user statistics
CREATE POLICY "System can update user statistics" ON user_statistics
  FOR UPDATE USING (true);
