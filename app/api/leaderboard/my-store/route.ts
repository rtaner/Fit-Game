import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeCode = searchParams.get('storeCode');

    if (!storeCode) {
      return NextResponse.json(
        { error: { code: 'MISSING_STORE_CODE', message: 'Mağaza kodu gerekli' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all users from the same store with their game sessions
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        store_code,
        active_badge_id,
        stores(store_name),
        game_sessions(score)
      `)
      .eq('store_code', parseInt(storeCode));

    if (error) {
      console.error('Error fetching store leaderboard:', error);
      return NextResponse.json(
        { error: { code: 'FETCH_ERROR', message: 'Liderlik tablosu yüklenemedi' } },
        { status: 500 }
      );
    }

    // Calculate total score, highest score and total games for each user
    const userStats = new Map<string, { username: string; storeCode: number; storeName: string; totalScore: number; highScore: number; totalGames: number; activeBadgeId: string | null }>();

    users?.forEach((user: any) => {
      if (!userStats.has(user.id)) {
        const storeName = user.stores?.store_name || `Mağaza ${user.store_code}`;
        userStats.set(user.id, {
          username: user.username,
          storeCode: user.store_code,
          storeName: storeName,
          totalScore: 0,
          highScore: 0,
          totalGames: 0,
          activeBadgeId: user.active_badge_id || null,
        });
      }

      const stats = userStats.get(user.id)!;
      
      // Process all game sessions for this user
      if (user.game_sessions && Array.isArray(user.game_sessions)) {
        user.game_sessions.forEach((session: any) => {
          stats.totalGames++;
          stats.totalScore += session.score; // Add to total score
          if (session.score > stats.highScore) {
            stats.highScore = session.score; // Track highest score
          }
        });
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
