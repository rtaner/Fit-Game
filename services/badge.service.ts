import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier: string | null;
  emoji: string;
  is_hidden: boolean;
  unlock_type: string;
  unlock_value: number;
  unlock_metadata: any;
  display_order: number;
}

export interface UserBadgeProgress {
  id: string;
  user_id: string;
  badge_code: string;
  current_value: number;
  tier_unlocked: string | null;
  unlocked_at: string | null;
  metadata: any;
}

export interface BadgeUnlock {
  badge: BadgeDefinition;
  isNew: boolean;
  progress: UserBadgeProgress;
}

export const badgeService = {
  // Check and award badges after a game ends
  async checkGameBadges(
    userId: string,
    sessionId: string,
    gameData: {
      score: number;
      highestStreak: number;
      averageResponseTime: number;
      totalQuestions: number;
      timeLeft: number;
      jokerUsed: boolean;
      jokerFailed: boolean;
    }
  ): Promise<BadgeUnlock[]> {
    const supabase = await createClient();
    const newBadges: BadgeUnlock[] = [];

    // Get or create user statistics
    await this.ensureUserStatistics(userId);

    // Update user statistics
    await this.updateUserStatistics(userId, gameData);

    // Check all badge types
    const checks = [
      this.checkStreakBadges(userId, gameData.highestStreak),
      this.checkSpeedBadges(userId, gameData.averageResponseTime),
      this.checkConsistencyBadges(userId),
      this.checkSecretBadges(userId, gameData),
    ];

    const results = await Promise.all(checks);
    results.forEach(badges => newBadges.push(...badges));

    return newBadges;
  },

  // Ensure user statistics record exists
  async ensureUserStatistics(userId: string): Promise<void> {
    // Use service role to bypass RLS
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: existing, error: selectError } = await supabase
      .from('user_statistics')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking user statistics:', selectError);
    }

    if (!existing) {
      console.log('Creating user statistics for:', userId);
      const { error: insertError } = await supabase.from('user_statistics').insert({
        user_id: userId,
        total_training_time_seconds: 0,
        total_questions_answered: 0,
        total_games_played: 0,
        highest_streak_ever: 0,
      });
      
      if (insertError) {
        console.error('Error creating user statistics:', insertError);
      } else {
        console.log('✅ User statistics created successfully');
      }
    }
  },

  // Update user statistics after a game
  async updateUserStatistics(
    userId: string,
    gameData: {
      score: number;
      highestStreak: number;
      totalQuestions: number;
    }
  ): Promise<void> {
    const supabase = await createClient();

    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) return;

    const updates: any = {
      total_questions_answered: stats.total_questions_answered + gameData.totalQuestions,
      total_games_played: stats.total_games_played + 1,
      highest_streak_ever: Math.max(stats.highest_streak_ever || 0, gameData.highestStreak),
      last_game_score: gameData.score,
      last_game_ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Track consecutive zero score games
    if (gameData.score === 0) {
      updates.consecutive_zero_score_games = (stats.consecutive_zero_score_games || 0) + 1;
    } else {
      updates.consecutive_zero_score_games = 0;
    }

    await supabase
      .from('user_statistics')
      .update(updates)
      .eq('user_id', userId);
  },

  // Check streak badges
  async checkStreakBadges(userId: string, streak: number): Promise<BadgeUnlock[]> {
    const supabase = await createClient();
    const newBadges: BadgeUnlock[] = [];

    const streakThresholds = [
      { code: 'streak_10', value: 10 },
      { code: 'streak_15', value: 15 },
      { code: 'streak_20', value: 20 },
      { code: 'streak_30', value: 30 },
      { code: 'streak_40', value: 40 },
      { code: 'streak_50', value: 50 },
    ];

    for (const threshold of streakThresholds) {
      if (streak >= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, streak);
        if (unlock) newBadges.push(unlock);
      }
    }

    return newBadges;
  },

  // Check speed badges
  async checkSpeedBadges(userId: string, avgResponseTime: number): Promise<BadgeUnlock[]> {
    const supabase = await createClient();
    const newBadges: BadgeUnlock[]= [];

    const speedThresholds = [
      { code: 'lightning_speed_bronze', value: 4000 },
      { code: 'lightning_speed_silver', value: 3000 },
      { code: 'lightning_speed_gold', value: 2000 },
    ];

    for (const threshold of speedThresholds) {
      if (avgResponseTime <= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, avgResponseTime);
        if (unlock) newBadges.push(unlock);
      }
    }

    return newBadges;
  },

  // Check consistency badges (total questions, total points, login streak)
  async checkConsistencyBadges(userId: string): Promise<BadgeUnlock[]> {
    const supabase = await createClient();
    const newBadges: BadgeUnlock[] = [];

    // Get user statistics
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) return newBadges;

    // Get total points from all game sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('score')
      .eq('user_id', userId);

    const totalPoints = sessions?.reduce((sum, s) => sum + s.score, 0) || 0;

    // Get user login streak
    const { data: user } = await supabase
      .from('users')
      .select('current_streak')
      .eq('id', userId)
      .single();

    const loginStreak = user?.current_streak || 0;

    // Check Emektar (total questions)
    const veteranThresholds = [
      { code: 'veteran_bronze', value: 100 },
      { code: 'veteran_silver', value: 500 },
      { code: 'veteran_gold', value: 1000 },
    ];

    for (const threshold of veteranThresholds) {
      if (stats.total_questions_answered >= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, stats.total_questions_answered);
        if (unlock) newBadges.push(unlock);
      }
    }

    // Check Puan Avcısı (total points)
    const pointThresholds = [
      { code: 'point_hunter_bronze', value: 100 },
      { code: 'point_hunter_silver', value: 5000 },
      { code: 'point_hunter_gold', value: 10000 },
    ];

    for (const threshold of pointThresholds) {
      if (totalPoints >= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, totalPoints);
        if (unlock) newBadges.push(unlock);
      }
    }

    // Check Günlük Rutin (login streak)
    const routineThresholds = [
      { code: 'daily_routine_bronze', value: 3 },
      { code: 'daily_routine_silver', value: 7 },
      { code: 'daily_routine_gold', value: 14 },
    ];

    for (const threshold of routineThresholds) {
      if (loginStreak >= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, loginStreak);
        if (unlock) newBadges.push(unlock);
      }
    }

    return newBadges;
  },

  // Check secret badges
  async checkSecretBadges(
    userId: string,
    gameData: {
      score: number;
      highestStreak: number;
      totalQuestions: number;
      timeLeft: number;
      jokerUsed: boolean;
      jokerFailed: boolean;
    }
  ): Promise<BadgeUnlock[]> {
    // Use service role to bypass RLS
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    const newBadges: BadgeUnlock[] = [];

    const { data: stats, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !stats) {
      console.log('❌ No user statistics found for secret badges:', error);
      return newBadges;
    }

    console.log('🔍 Checking secret badges...');
    console.log('  Consecutive zero scores:', stats.consecutive_zero_score_games);

    // Hatasız Kul - 4 consecutive zero score games
    if (stats.consecutive_zero_score_games >= 4) {
      console.log('  ✅ Flawless Human condition met!');
      const unlock = await this.awardBadge(userId, 'flawless_human', stats.consecutive_zero_score_games);
      if (unlock) {
        console.log('  🎉 Flawless Human badge awarded!');
        newBadges.push(unlock);
      } else {
        console.log('  ⚠️ Flawless Human badge already unlocked or failed');
      }
    }

    // Gece Nöbeti - Playing between 02:00 - 05:00
    const currentHour = new Date().getHours();
    console.log('  Current hour:', currentHour);
    if (currentHour >= 2 && currentHour < 5) {
      console.log('  ✅ Night Owl condition met!');
      const unlock = await this.awardBadge(userId, 'night_owl', 1);
      if (unlock) {
        console.log('  🎉 Night Owl badge awarded!');
        newBadges.push(unlock);
      } else {
        console.log('  ⚠️ Night Owl badge already unlocked or failed');
      }
    } else {
      console.log('  ❌ Night Owl condition NOT met (not between 02:00-05:00)');
    }

    // Şanssız - Used 50-50 joker but still failed
    if (gameData.jokerUsed && gameData.jokerFailed) {
      const unlock = await this.awardBadge(userId, 'unlucky', 1);
      if (unlock) newBadges.push(unlock);
    }

    // Son Saniye Golü - Answered with less than 1 second left
    if (gameData.timeLeft <= 1 && gameData.timeLeft > 0) {
      const unlock = await this.awardBadge(userId, 'last_second_goal', 1);
      if (unlock) newBadges.push(unlock);
    }

    // Ninja - 4 correct answers in 10 seconds
    // This needs to be tracked during the game (we'll add this logic later)

    return newBadges;
  },

  // Award a badge to a user
  async awardBadge(
    userId: string,
    badgeCode: string,
    currentValue: number
  ): Promise<BadgeUnlock | null> {
    const supabase = await createClient();

    // Get badge definition
    const { data: badge } = await supabase
      .from('badge_definitions')
      .select('*')
      .eq('code', badgeCode)
      .single();

    if (!badge) return null;

    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_code', badgeCode)
      .single();

    if (existing && existing.tier_unlocked) {
      // Already unlocked
      return null;
    }

    // Award the badge
    if (existing) {
      // Update existing progress
      await supabase
        .from('user_badge_progress')
        .update({
          current_value: currentValue,
          tier_unlocked: badge.tier || 'unlocked',
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new progress entry
      await supabase.from('user_badge_progress').insert({
        user_id: userId,
        badge_code: badgeCode,
        current_value: currentValue,
        tier_unlocked: badge.tier || 'unlocked',
        unlocked_at: new Date().toISOString(),
      });
    }

    // Fetch updated progress
    const { data: progress } = await supabase
      .from('user_badge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_code', badgeCode)
      .single();

    return {
      badge,
      isNew: true,
      progress: progress!,
    };
  },

  // Get all badges for a user (with progress)
  async getUserBadges(userId: string): Promise<{
    unlocked: Array<{ badge: BadgeDefinition; progress: UserBadgeProgress }>;
    locked: Array<{ badge: BadgeDefinition; progress: UserBadgeProgress | null }>;
    activeBadgeId: string | null;
  }> {
    const supabase = await createClient();

    // Get all badge definitions (excluding hidden ones for locked view)
    const { data: allBadges } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('display_order');

    // Get user's badge progress
    const { data: userProgress } = await supabase
      .from('user_badge_progress')
      .select('*')
      .eq('user_id', userId);

    // Get user's active badge ID
    const { data: userData } = await supabase
      .from('users')
      .select('active_badge_id')
      .eq('id', userId)
      .single();

    const activeBadgeId = userData?.active_badge_id || null;

    const progressMap = new Map(userProgress?.map(p => [p.badge_code, p]) || []);

    const unlocked: Array<{ badge: BadgeDefinition; progress: UserBadgeProgress }> = [];
    const locked: Array<{ badge: BadgeDefinition; progress: UserBadgeProgress | null }> = [];

    allBadges?.forEach(badge => {
      const progress = progressMap.get(badge.code);
      
      if (progress && progress.tier_unlocked) {
        unlocked.push({ badge, progress });
      } else {
        // Don't show hidden badges if not unlocked
        if (!badge.is_hidden) {
          locked.push({ badge, progress: progress || null });
        }
      }
    });

    return { unlocked, locked, activeBadgeId };
  },

  // Get user statistics
  async getUserStatistics(userId: string): Promise<any> {
    const supabase = await createClient();

    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    return stats;
  },

  // Update training time
  async updateTrainingTime(userId: string, secondsSpent: number): Promise<BadgeUnlock[]> {
    const supabase = await createClient();
    const newBadges: BadgeUnlock[] = [];

    await this.ensureUserStatistics(userId);

    // Get current training time
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('total_training_time_seconds')
      .eq('user_id', userId)
      .single();

    const newTotal = (stats?.total_training_time_seconds || 0) + secondsSpent;

    // Update statistics
    await supabase
      .from('user_statistics')
      .update({
        total_training_time_seconds: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Check education badges
    const educationThresholds = [
      { code: 'education_lover_bronze', value: 300 },
      { code: 'education_lover_silver', value: 600 },
      { code: 'education_lover_gold', value: 1200 },
    ];

    for (const threshold of educationThresholds) {
      if (newTotal >= threshold.value) {
        const unlock = await this.awardBadge(userId, threshold.code, newTotal);
        if (unlock) newBadges.push(unlock);
      }
    }

    return newBadges;
  },
};
