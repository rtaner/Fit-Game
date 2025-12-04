import { createClient } from '@/lib/supabase/client';

export const streakService = {
  async updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const supabase = createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_login_date')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return { currentStreak: 0, longestStreak: 0 };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = user.last_login_date ? new Date(user.last_login_date) : null;
    const lastLoginDate = lastLogin
      ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
      : null;

    let currentStreak = user.current_streak;
    let longestStreak = user.longest_streak;

    if (!lastLoginDate) {
      // First login ever
      currentStreak = 1;
      longestStreak = Math.max(longestStreak, 1);
    } else {
      const daysDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no change
        return { currentStreak, longestStreak };
      } else if (daysDiff === 1) {
        // Consecutive day
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Streak broken
        currentStreak = 1;
      }
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_login_date: now.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating streak:', updateError);
    }

    return { currentStreak, longestStreak };
  },

  async getStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const supabase = createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    return {
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
    };
  },
};
