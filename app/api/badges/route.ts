import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'userId gerekli' } },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
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

    // Get all badge definitions
    const { data: allBadges, error: badgesError } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('display_order');

    console.log('Badges from DB:', allBadges?.length, 'badges');
    if (badgesError) console.error('Badges error:', badgesError);

    // Get user's badge progress
    const { data: userProgress, error: progressError } = await supabase
      .from('user_badge_progress')
      .select('*')
      .eq('user_id', userId);

    console.log('User progress:', userProgress?.length, 'records');
    if (progressError) console.error('Progress error:', progressError);

    // Get user's active badge ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('active_badge_id')
      .eq('id', userId)
      .single();

    const activeBadgeId = userData?.active_badge_id || null;
    console.log('Active badge ID:', activeBadgeId);

    if (!allBadges || allBadges.length === 0) {
      console.log('No badges found in database!');
      return NextResponse.json({ data: { badges: [], badgesByCategory: {} } });
    }

    // Combine badges with user progress
    const badgesWithProgress = allBadges.map(badge => {
      const progress = userProgress?.find(p => p.badge_code === badge.code);
      const isActive = progress?.id === activeBadgeId;
      
      return {
        id: badge.id,
        code: badge.code,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        tier: badge.tier,
        emoji: badge.emoji,
        isHidden: badge.is_hidden,
        unlockType: badge.unlock_type,
        unlockValue: badge.unlock_value,
        userProgress: {
          id: progress?.id,
          currentValue: progress?.current_value || 0,
          tierUnlocked: progress?.tier_unlocked,
          unlockedAt: progress?.unlocked_at,
          isUnlocked: !!progress?.unlocked_at,
          isActive,
        },
      };
    });

    // Group by category
    const badgesByCategory = badgesWithProgress.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      data: {
        badges: badgesWithProgress,
        badgesByCategory,
        activeBadgeId,
      },
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Badge\'ler alınamadı' } },
      { status: 500 }
    );
  }
}
