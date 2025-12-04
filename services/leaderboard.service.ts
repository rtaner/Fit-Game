import { createClient } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  storeCode: number;
  storeName: string;
  score: number;
  totalGames: number;
  activeBadge?: {
    id: string;
    code: string;
    name: string;
    emoji: string;
  } | null;
}

export interface StoreLeaderboardEntry {
  rank: number;
  storeCode: number;
  storeName: string;
  averageScore: number;
  totalGames: number;
  totalPlayers: number;
}

// Simple in-memory cache
let individualCache: { data: LeaderboardEntry[]; timestamp: number } | null = null;
let storeCache: { data: StoreLeaderboardEntry[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const leaderboardService = {
  async getIndividualLeaderboard(limit: number = 100, timeFilter: 'week' | 'month' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    // Check cache (separate cache for each time filter)
    const cacheKey = `individual_${timeFilter}`;
    if (individualCache && individualCache.timestamp && Date.now() - individualCache.timestamp < CACHE_TTL) {
      return individualCache.data;
    }

    const supabase = createClient();

    // Calculate date filter
    let dateFilter: string | null = null;
    const now = new Date();
    
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = weekAgo.toISOString();
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = monthAgo.toISOString();
    }

    // Build query with automatic join via foreign key
    let query = supabase
      .from('game_sessions')
      .select(`
        score,
        user_id,
        ended_at,
        users!inner(username, store_code, active_badge_id, stores(store_name))
      `)
      .order('score', { ascending: false })
      .limit(limit * 2); // Get more to handle duplicates

    // Apply date filter if needed
    if (dateFilter) {
      query = query.gte('ended_at', dateFilter);
    }

    const { data: sessions, error } = await query;

    if (error || !sessions) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Group by user and get their highest score
    const userScores = new Map<string, { username: string; storeCode: number; storeName: string; highScore: number; games: number; activeBadgeId: string | null }>();

    sessions.forEach((session: any) => {
      const userId = session.user_id;
      const score = session.score;
      const username = session.users?.username || 'Unknown';
      const storeCode = session.users?.store_code || 0;
      const storeName = session.users?.stores?.store_name || `Mağaza ${storeCode}`;
      const activeBadgeId = session.users?.active_badge_id || null;

      if (userScores.has(userId)) {
        const existing = userScores.get(userId)!;
        existing.highScore = Math.max(existing.highScore, score);
        existing.games += 1;
      } else {
        userScores.set(userId, {
          username,
          storeCode,
          storeName,
          highScore: score,
          games: 1,
          activeBadgeId,
        });
      }
    });

    // Get all unique active badge IDs
    const activeBadgeIds = Array.from(userScores.values())
      .map(u => u.activeBadgeId)
      .filter((id): id is string => id !== null);

    // Fetch badge details for all active badges
    const badgeMap = new Map<string, { id: string; code: string; name: string; emoji: string }>();
    
    if (activeBadgeIds.length > 0) {
      const { data: badgeProgress } = await supabase
        .from('user_badge_progress')
        .select('id, badge_code')
        .in('id', activeBadgeIds);

      if (badgeProgress) {
        const badgeCodes = badgeProgress.map(bp => bp.badge_code);
        const { data: badgeDefinitions } = await supabase
          .from('badge_definitions')
          .select('id, code, name, emoji')
          .in('code', badgeCodes);

        if (badgeDefinitions) {
          // Create a map from badge_code to badge definition
          const codeToDefMap = new Map(badgeDefinitions.map(bd => [bd.code, bd]));
          
          // Map progress ID to badge definition
          badgeProgress.forEach(bp => {
            const def = codeToDefMap.get(bp.badge_code);
            if (def) {
              badgeMap.set(bp.id, {
                id: def.id,
                code: def.code,
                name: def.name,
                emoji: def.emoji,
              });
            }
          });
        }
      }
    }

    // Convert to array and sort
    const leaderboard: LeaderboardEntry[] = Array.from(userScores.entries())
      .map(([userId, data]) => ({
        rank: 0,
        userId,
        username: data.username,
        storeCode: data.storeCode,
        storeName: data.storeName,
        score: data.highScore,
        totalGames: data.games,
        activeBadge: data.activeBadgeId ? badgeMap.get(data.activeBadgeId) || null : null,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Update cache
    individualCache = {
      data: leaderboard,
      timestamp: Date.now(),
    };

    return leaderboard;
  },

  async getStoreLeaderboard(limit: number = 100): Promise<StoreLeaderboardEntry[]> {
    // Check cache
    if (storeCache && Date.now() - storeCache.timestamp < CACHE_TTL) {
      return storeCache.data;
    }

    const supabase = createClient();

    // Get all sessions with user data
    const { data: sessions, error } = await supabase
      .from('game_sessions')
      .select(`
        score,
        user_id,
        users!inner(store_code)
      `);

    if (error || !sessions) {
      console.error('Error fetching store leaderboard:', error);
      return [];
    }

    // Get store names
    const { data: stores } = await supabase.from('stores').select('store_code, store_name');

    const storeMap = new Map(stores?.map((s) => [s.store_code, s.store_name]) || []);

    // Group by store
    const storeScores = new Map<number, { totalScore: number; games: number; players: Set<string> }>();

    sessions.forEach((session: any) => {
      const storeCode = session.users?.store_code;
      const score = session.score;
      const userId = session.user_id;

      if (!storeCode) return;

      if (storeScores.has(storeCode)) {
        const existing = storeScores.get(storeCode)!;
        existing.totalScore += score;
        existing.games += 1;
        existing.players.add(userId);
      } else {
        storeScores.set(storeCode, {
          totalScore: score,
          games: 1,
          players: new Set([userId]),
        });
      }
    });

    // Convert to array and calculate averages
    const leaderboard: StoreLeaderboardEntry[] = Array.from(storeScores.entries())
      .map(([storeCode, data]) => ({
        rank: 0,
        storeCode,
        storeName: storeMap.get(storeCode) || `Mağaza ${storeCode}`,
        averageScore: data.totalScore / data.games,
        totalGames: data.games,
        totalPlayers: data.players.size,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Update cache
    storeCache = {
      data: leaderboard,
      timestamp: Date.now(),
    };

    return leaderboard;
  },

  clearCache() {
    individualCache = null;
    storeCache = null;
  },
};
