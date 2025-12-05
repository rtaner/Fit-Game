export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  store_code: number;
  role: 'employee' | 'admin';
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  active_badge_id: string | null;
  reset_token: string | null;
  reset_token_expires: string | null;
  force_password_change: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  store_code: number;
  store_name: string;
  city: string | null;
  region: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  is_quiz_active: boolean;
  is_all_categories?: boolean; // Special flag for "All Categories" category
  created_at: string;
  updated_at: string;
}

export interface QuestionItem {
  id: string;
  category_id: string;
  name: string;
  image_url: string;
  cloudinary_public_id: string | null;
  description: string;
  explanation: string | null;
  tags: string[];
  gender: 'Kadın' | 'Erkek' | null;
  fit_category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  category_id: string;
  score: number;
  total_questions: number;
  lifeline_50_used: boolean;
  lifeline_skip_used: boolean;
  asked_questions: string[];
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface AnswerAnalytic {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  correct_answer_id: string;
  selected_answer_id: string;
  is_correct: boolean;
  response_time_ms: number;
  lifeline_used: string | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  earned_at: string;
}

export interface ErrorReport {
  id: string;
  user_id: string;
  question_id: string;
  report_text: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

// Input types for CRUD operations
export interface StoreCreateInput {
  store_code: number;
  store_name: string;
  is_active?: boolean;
}

export interface StoreUpdateInput {
  store_name?: string;
  is_active?: boolean;
}
