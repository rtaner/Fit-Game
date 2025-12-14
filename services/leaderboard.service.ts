import { createClient } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  storeCode: number;
  storeName: string;
  score: number; // Total score (sum of all games)
  highScore: number; // Highest single game score (for tiebreaker)
  totalGames: number;
  activeBadge?: {
    id: string;
    code: string;
    name: string;
    image_url?: string | null;
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

// Simple in-memory cache - separate cache for each time filter
const individualCacheMap = new Map<string, { data: LeaderboardEntry[]; timestamp: number }>();
let storeCache: { data: StoreLeaderboardEntry[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const leaderboardService = {
  async getIndividualLeaderboard(limit: number = 100, timeFilter: 'week' | 'month' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    // Check cache (separate cache for each time filter)
    const cacheKey = `individual_${timeFilter}`;
    const cachedData = individualCacheMap.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }

    const supabase = createClient();

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

    // STEP 1: Get ALL users first
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, username, store_code, active_badge_id, stores(store_name)')
      .order('username');

    if (usersError || !allUsers) {
      console.error('Error fetching users:', usersError);
      return [];
    }

    // STEP 2: Get game sessions (with date filter if needed)
    let sessionsQuery = supabase
      .from('game_sessions')
      .select('score, user_id, ended_at')
      .not('ended_at', 'is', null);

    // Apply date filter if needed
    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('ended_at', dateFilter);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return [];
    }

    // STEP 3: Group sessions by user
    const userSessionsMap = new Map<string, { totalScore: number; highScore: number; games: number }>();
    
    sessions?.forEach((session: any) => {
      const userId = session.user_id;
      const score = session.score || 0;

      if (userSessionsMap.has(userId)) {
        const existing = userSessionsMap.get(userId)!;
        existing.totalScore += score;
        existing.highScore = Math.max(existing.highScore, score);
        existing.games += 1;
      } else {
        userSessionsMap.set(userId, {
          totalScore: score,
          highScore: score,
          games: 1,
        });
      }
    });

    // STEP 4: Combine all users with their scores (0 if no games in period)
    const userScores = new Map<string, { username: string; storeCode: number; storeName: string; totalScore: number; highScore: number; games: number; activeBadgeId: string | null }>();

    allUsers.forEach((user: any) => {
      const userId = user.id;
      const username = user.username || 'Unknown';
      const storeCode = user.store_code || 0;
      const storeName = user.stores?.store_name || `Mağaza ${storeCode}`;
      const activeBadgeId = user.active_badge_id || null;

      const userSessions = userSessionsMap.get(userId);

      userScores.set(userId, {
        username,
        storeCode,
        storeName,
        totalScore: userSessions?.totalScore || 0,
        highScore: userSessions?.highScore || 0,
        games: userSessions?.games || 0,
        activeBadgeId,
      });
    });

    // Get all unique active badge IDs
    const activeBadgeIds = Array.from(userScores.values())
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
                image_url: def.image_url,
              });
            }
          });
        }
      }
    }

    // Convert to array and sort (Hybrid: Total score primary, High score secondary)
    const leaderboard: LeaderboardEntry[] = Array.from(userScores.entries())
      .map(([userId, data]) => ({
        rank: 0,
        userId,
        username: data.username,
        storeCode: data.storeCode,
        storeName: data.storeName,
        score: data.totalScore, // Show total score
        highScore: data.highScore, // Keep high score for tiebreaker and display
        totalGames: data.games,
        activeBadge: data.activeBadgeId ? badgeMap.get(data.activeBadgeId) || null : null,
      }))
      .sort((a, b) => {
        // Primary: Sort by total score (descending)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Secondary: If total scores are equal, sort by highest single game score (descending)
        return b.highScore - a.highScore;
      })
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Update cache with correct key
    individualCacheMap.set(cacheKey, {
      data: leaderboard,
      timestamp: Date.now(),
    });

    return leaderboard;
  },

  async getStoreLeaderboard(limit: number = 100): Promise<StoreLeaderboardEntry[]> {
    // Check cache
    if (storeCache && Date.now() - storeCache.timestamp < CACHE_TTL) {
      return storeCache.data;
    }

    const supabase = createClient();

    // STEP 1: Get all stores that have members
    const { data: storesWithMembers, error: storesError } = await supabase
      .from('users')
      .select('store_code')
      .not('store_code', 'is', null);

    if (storesError) {
      console.error('Error fetching stores with members:', storesError);
      return [];
    }

    // Get unique store codes that have members
    const storeCodesWithMembers = Array.from(new Set(storesWithMembers?.map(u => u.store_code) || []));

    // STEP 2: Get store names
    const { data: stores } = await supabase.from('stores').select('store_code, store_name');
    const storeMap = new Map(stores?.map((s) => [s.store_code, s.store_name]) || []);

    // STEP 3: Get all game sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select(`
        score,
        user_id,
        users!inner(store_code)
      `);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return [];
    }

    // STEP 4: Group sessions by store
    const storeScores = new Map<number, { totalScore: number; games: number; players: Set<string> }>();

    sessions?.forEach((session: any) => {
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

    // STEP 5: Get member count for each store
    const storeMemberCount = new Map<number, number>();
    storesWithMembers?.forEach((user: any) => {
      const storeCode = user.store_code;
      storeMemberCount.set(storeCode, (storeMemberCount.get(storeCode) || 0) + 1);
    });

    // STEP 6: Create leaderboard with ALL stores that have members
    const leaderboard: StoreLeaderboardEntry[] = storeCodesWithMembers
      .map((storeCode) => {
        const storeData = storeScores.get(storeCode);
        const memberCount = storeMemberCount.get(storeCode) || 0;

        return {
          rank: 0,
          storeCode,
          storeName: storeMap.get(storeCode) || `Mağaza ${storeCode}`,
          averageScore: storeData ? storeData.totalScore / storeData.games : 0,
          totalGames: storeData?.games || 0,
          totalPlayers: memberCount,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
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
    individualCacheMap.clear();
    storeCache = null;
  },
};
