-- Add gender and fit_category columns to question_items table
ALTER TABLE question_items
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('Kadın', 'Erkek')),
ADD COLUMN IF NOT EXISTS fit_category VARCHAR(50);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_gender ON question_items(gender);
CREATE INDEX IF NOT EXISTS idx_questions_fit_category ON question_items(fit_category);
CREATE INDEX IF NOT EXISTS idx_questions_gender_fit ON question_items(gender, fit_category);

-- Add is_quiz_active column to quiz_categories if not exists (for enable/disable categories)
ALTER TABLE quiz_categories
ADD COLUMN IF NOT EXISTS is_quiz_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_categories_quiz_active ON quiz_categories(is_quiz_active);

-- Add asked_questions column to game_sessions to track asked questions
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS asked_questions JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_sessions_asked_questions ON game_sessions USING GIN(asked_questions);

COMMENT ON COLUMN question_items.gender IS 'Ürün cinsiyeti: Kadın veya Erkek';
COMMENT ON COLUMN question_items.fit_category IS 'Fit kategorisi: SUPER SKINNY, SKINNY, MOM, BOYFRIEND, STRAIGHT, SLIM, REGULAR, RELAXED, vb.';
COMMENT ON COLUMN quiz_categories.is_quiz_active IS 'Kategori quiz listesinde aktif mi?';
COMMENT ON COLUMN game_sessions.asked_questions IS 'Bu oturumda sorulan soru ID listesi';
