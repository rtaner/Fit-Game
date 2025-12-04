-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  store_code INTEGER NOT NULL CHECK (store_code BETWEEN 1500 AND 1900),
  role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_store_code ON users(store_code);
CREATE INDEX idx_users_role ON users(role);

-- Stores Table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_code INTEGER UNIQUE NOT NULL CHECK (store_code BETWEEN 1500 AND 1900),
  store_name VARCHAR(200) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stores_code ON stores(store_code);
CREATE INDEX idx_stores_active ON stores(is_active);

-- Quiz Categories Table
CREATE TABLE quiz_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_active ON quiz_categories(is_active);
CREATE INDEX idx_categories_order ON quiz_categories(display_order);

-- Question Items Table
CREATE TABLE question_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES quiz_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  description TEXT NOT NULL,
  explanation TEXT,
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_category ON question_items(category_id);
CREATE INDEX idx_questions_active ON question_items(is_active);
CREATE INDEX idx_questions_tags ON question_items USING GIN(tags);

-- Game Sessions Table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES quiz_categories(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  lifeline_50_used BOOLEAN DEFAULT FALSE,
  lifeline_skip_used BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_sessions_category ON game_sessions(category_id);
CREATE INDEX idx_sessions_score ON game_sessions(score DESC);
CREATE INDEX idx_sessions_started ON game_sessions(started_at DESC);

-- Answer Analytics Table
CREATE TABLE answer_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_items(id) ON DELETE CASCADE,
  correct_answer_id UUID NOT NULL REFERENCES question_items(id) ON DELETE CASCADE,
  selected_answer_id UUID NOT NULL REFERENCES question_items(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  lifeline_used VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_session ON answer_analytics(session_id);
CREATE INDEX idx_analytics_user ON answer_analytics(user_id);
CREATE INDEX idx_analytics_question ON answer_analytics(question_id);
CREATE INDEX idx_analytics_correct_answer ON answer_analytics(correct_answer_id);
CREATE INDEX idx_analytics_selected_answer ON answer_analytics(selected_answer_id);
CREATE INDEX idx_analytics_created ON answer_analytics(created_at DESC);

-- User Badges Table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);
CREATE INDEX idx_badges_type ON user_badges(badge_type);

-- Error Reports Table
CREATE TABLE error_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_items(id) ON DELETE CASCADE,
  report_text TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reports_status ON error_reports(status);
CREATE INDEX idx_reports_question ON error_reports(question_id);
CREATE INDEX idx_reports_created ON error_reports(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_categories_updated_at BEFORE UPDATE ON quiz_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_items_updated_at BEFORE UPDATE ON question_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
