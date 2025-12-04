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

    // Calculate highest score and total games for each user
    const userStats = new Map<string, { username: string; storeCode: number; storeName: string; maxScore: number; totalGames: number }>();

    users?.forEach((user: any) => {
      if (!userStats.has(user.id)) {
        const storeName = user.stores?.store_name || `Mağaza ${user.store_code}`;
        userStats.set(user.id, {
          username: user.username,
          storeCode: user.store_code,
          storeName: storeName,
          maxScore: 0,
          totalGames: 0,
        });
      }

      const stats = userStats.get(user.id)!;
      
      // Process all game sessions for this user
      if (user.game_sessions && Array.isArray(user.game_sessions)) {
        user.game_sessions.forEach((session: any) => {
          stats.totalGames++;
          if (session.score > stats.maxScore) {
            stats.maxScore = session.score;
          }
        });
      }
    });

    // Convert to array and sort by max score
    const leaderboard = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        storeCode: stats.storeCode,
        storeName: stats.storeName,
        score: stats.maxScore,
        totalGames: stats.totalGames,
      }))
      .sort((a, b) => b.score - a.score)
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
