-- Seed Badge Definitions for Faz 1
-- This populates the badge_definitions table with all Phase 1 badges

-- A. EDUCATION BADGES
-- 1. Eğitim Sever (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('education_lover_bronze', 'Eğitim Sever', 'Training modunda 5 dakika geçir', 'education', 'bronze', '📚', FALSE, 'training_time', 300, 1),
('education_lover_silver', 'Eğitim Sever', 'Training modunda 10 dakika geçir', 'education', 'silver', '📚', FALSE, 'training_time', 600, 2),
('education_lover_gold', 'Eğitim Sever', 'Training modunda 20 dakika geçir', 'education', 'gold', '📚', FALSE, 'training_time', 1200, 3);

-- 2. Kategori Uzmanı (Tiered - will be created dynamically per category)
-- Template for category expert badges (created programmatically)

-- B. PERFORMANCE BADGES
-- 4. Streak Badges (Single tier each)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('streak_10', 'İlk Alev', 'Tek oyunda 10 streak yap', 'performance', NULL, '🔥', FALSE, 'single_game_streak', 10, 10),
('streak_15', 'Yıldırım', 'Tek oyunda 15 streak yap', 'performance', NULL, '⚡', FALSE, 'single_game_streak', 15, 11),
('streak_20', 'Parlayan', 'Tek oyunda 20 streak yap', 'performance', NULL, '🌟', FALSE, 'single_game_streak', 20, 12),
('streak_30', 'Roket', 'Tek oyunda 30 streak yap', 'performance', NULL, '🚀', FALSE, 'single_game_streak', 30, 13),
('streak_40', 'Şampiyon', 'Tek oyunda 40 streak yap', 'performance', NULL, '🏆', FALSE, 'single_game_streak', 40, 14),
('streak_50', 'Efsane', 'Tek oyunda 50 streak yap', 'performance', NULL, '🔥', FALSE, 'single_game_streak', 50, 15);

-- 5. Şimşek Hızı (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('lightning_speed_bronze', 'Şimşek Hızı', 'Bir oyunda ortalama 4 saniye altı cevaplama', 'performance', 'bronze', '⚡', FALSE, 'average_response_time', 4000, 20),
('lightning_speed_silver', 'Şimşek Hızı', 'Bir oyunda ortalama 3 saniye altı cevaplama', 'performance', 'silver', '⚡', FALSE, 'average_response_time', 3000, 21),
('lightning_speed_gold', 'Şimşek Hızı', 'Bir oyunda ortalama 2 saniye altı cevaplama', 'performance', 'gold', '⚡', FALSE, 'average_response_time', 2000, 22);

-- 6. Pes Etmeyen
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('never_give_up', 'Pes Etmeyen', 'Kaybettikten sonra 3 dakika içinde tekrar oyna ve daha yüksek skor al', 'performance', NULL, '💪', FALSE, 'comeback', 180, 30);

-- C. CONSISTENCY BADGES
-- 7. Günlük Rutin (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('daily_routine_bronze', 'Günlük Rutin', '3 gün üst üste giriş yap', 'consistency', 'bronze', '📅', FALSE, 'login_streak', 3, 40),
('daily_routine_silver', 'Günlük Rutin', '7 gün üst üste giriş yap', 'consistency', 'silver', '📅', FALSE, 'login_streak', 7, 41),
('daily_routine_gold', 'Günlük Rutin', '14 gün üst üste giriş yap', 'consistency', 'gold', '📅', FALSE, 'login_streak', 14, 42);

-- 8. Emektar (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('veteran_bronze', 'Emektar', 'Toplam 100 soru çöz', 'consistency', 'bronze', '🎖️', FALSE, 'total_questions', 100, 50),
('veteran_silver', 'Emektar', 'Toplam 500 soru çöz', 'consistency', 'silver', '🎖️', FALSE, 'total_questions', 500, 51),
('veteran_gold', 'Emektar', 'Toplam 1000 soru çöz', 'consistency', 'gold', '🎖️', FALSE, 'total_questions', 1000, 52);

-- 9. Puan Avcısı (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('point_hunter_bronze', 'Puan Avcısı', 'Toplam 100 puan kazan', 'consistency', 'bronze', '💎', FALSE, 'total_points', 100, 60),
('point_hunter_silver', 'Puan Avcısı', 'Toplam 5000 puan kazan', 'consistency', 'silver', '💎', FALSE, 'total_points', 5000, 61),
('point_hunter_gold', 'Puan Avcısı', 'Toplam 10000 puan kazan', 'consistency', 'gold', '💎', FALSE, 'total_points', 10000, 62);

-- D. COMPETITION BADGES
-- 10. Mağaza Sancaktarı (Tiered)
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('store_champion_bronze', 'Mağaza Sancaktarı', 'Mağazanda top 3''e gir', 'competition', 'bronze', '🚩', FALSE, 'store_rank', 3, 70),
('store_champion_silver', 'Mağaza Sancaktarı', 'Mağazanda top 2''ye gir', 'competition', 'silver', '🚩', FALSE, 'store_rank', 2, 71),
('store_champion_gold', 'Mağaza Sancaktarı', 'Mağazanda 1. ol', 'competition', 'gold', '🚩', FALSE, 'store_rank', 1, 72);

-- E. SECRET BADGES
-- 12. Hatasız Kul
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('flawless_human', 'Hatasız Kul', 'Arka arkaya 4 oyunda 0 puan al', 'secret', NULL, '😅', TRUE, 'consecutive_zero_scores', 4, 100);

-- 13. Gece Nöbeti
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('night_owl', 'Gece Nöbeti', 'Gece 02:00 - 05:00 arası oyun oyna', 'secret', NULL, '🦉', TRUE, 'night_play', 1, 101);

-- 14. Şanssız
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('unlucky', 'Şanssız', '50-50 jokerini kullan ama yine de yanlış şıkkı seç', 'secret', NULL, '🍀', TRUE, 'joker_fail', 1, 102);

-- 15. Son Saniye Golü
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('last_second_goal', 'Son Saniye Golü', 'Süre bitimine 1 saniyeden az kala doğru cevap ver', 'secret', NULL, '⏱️', TRUE, 'last_second_answer', 1, 103);

-- 16. Ninja
INSERT INTO badge_definitions (code, name, description, category, tier, emoji, is_hidden, unlock_type, unlock_value, display_order) VALUES
('ninja', 'Ninja', '10 saniyede 4 soruyu doğru bil', 'secret', NULL, '🥷', TRUE, 'speed_demon', 1, 104);
