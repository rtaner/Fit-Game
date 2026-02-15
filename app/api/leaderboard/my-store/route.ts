import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeCode = searchParams.get('storeCode');
    const timeFilter = (searchParams.get('timeFilter') || 'all') as 'week' | 'month' | 'all';

    if (!storeCode) {
      return NextResponse.json(
        { error: { code: 'MISSING_STORE_CODE', message: 'Mağaza kodu gerekli' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calculate date filter
    let dateFilter: string | null = null;
    const now = new Date();
    
    if (timeFilter === 'week') {
      // Get Monday of current week (week starts on Monday)
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days
      const monday = new Date(now);
      monday.setDate(now.getDate() - daysFromMonday);
      monday.setHours(0, 0, 0, 0); // Start of Monday
      dateFilter = monday.toISOString();
    } else if (timeFilter === 'month') {
      // Get first day of current month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      dateFilter = firstDayOfMonth.toISOString();
    }

    // Get all users from the same store
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        store_code,
        active_badge_id,
        stores(store_name)
      `)
      .eq('store_code', parseInt(storeCode));

    if (usersError || !allUsers) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: { code: 'FETCH_ERROR', message: 'Liderlik tablosu yüklenemedi' } },
        { status: 500 }
      );
    }

    // Get game sessions for these users (with date filter if needed)
    let sessionsQuery = supabase
      .from('game_sessions')
      .select('score, user_id, ended_at')
      .in('user_id', allUsers.map(u => u.id))
      .not('ended_at', 'is', null);

    // Apply date filter if needed
    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('ended_at', dateFilter);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: { code: 'FETCH_ERROR', message: 'Oyun verileri yüklenemedi' } },
        { status: 500 }
      );
    }

    // Calculate total score, highest score and total games for each user
    const userStats = new Map<string, { username: string; storeCode: number; storeName: string; totalScore: number; highScore: number; totalGames: number; activeBadgeId: string | null }>();

    allUsers.forEach((user: any) => {
      const userId = user.id;
      const username = user.username || 'Unknown';
      const storeCode = user.store_code || 0;
      const storeName = user.stores?.store_name || `Mağaza ${storeCode}`;
      const activeBadgeId = user.active_badge_id || null;

      userStats.set(userId, {
        username,
        storeCode,
        storeName,
        totalScore: 0,
        highScore: 0,
        totalGames: 0,
        activeBadgeId,
      });
    });

    // Process game sessions
    sessions?.forEach((session: any) => {
      const userId = session.user_id;
      const score = session.score || 0;

      if (userStats.has(userId)) {
        const stats = userStats.get(userId)!;
        stats.totalGames++;
        stats.totalScore += score;
        if (score > stats.highScore) {
          stats.highScore = score;
        }
      }
    });

    // Get all unique active badge IDs
    const activeBadgeIds = Array.from(userStats.values())
      .map(u => u.activeBadgeId)
      .filter((id): id is string => id !== null);

    // Fetch badge details for all active badges
    const badgeMap = new Map<string, { id: string; code: string; name: string; image_url?: string | null }>();
    
    if (activeBadgeIds.length > 0) {
      const { data: badgeProgress } = await supabase
        .from('user_badge_progress')
        .select('id, badge_code')
        .in('id', activeBadgeIds);

      if (badgeProgress) {
        const badgeCodes = badgeProgress.map(bp => bp.badge_code);
        const { data: badgeDefinitions } = await supabase
          .from('badge_definitions')
          .select('id, code, name, image_url')
          .in('code', badgeCodes);

        if (badgeDefinitions) {
          const codeToDefMap = new Map(badgeDefinitions.map(bd => [bd.code, bd]));
          
          badgeProgress.forEach(bp => {
            const def = codeToDefMap.get(bp.badge_code);
            if (def) {
              badgeMap.set(bp.id, {
                id: def.id,
                code: def.code,
                name: def.name,
                image_url: def.image_url,
              });
            }
          });
        }
      }
    }

    // Convert to array and sort by total score (with high score as tiebreaker)
    const leaderboard = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        storeCode: stats.storeCode,
        storeName: stats.storeName,
        score: stats.totalScore, // Total score
        highScore: stats.highScore, // Highest single game score
        totalGames: stats.totalGames,
        activeBadge: stats.activeBadgeId ? badgeMap.get(stats.activeBadgeId) || null : null,
      }))
      .sort((a, b) => {
        // Primary: Sort by total score (descending)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Secondary: If total scores are equal, sort by highest single game score (descending)
        return b.highScore - a.highScore;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Error in my-store leaderboard:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
