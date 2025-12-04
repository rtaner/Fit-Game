import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor' } },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, store_code')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı' } },
        { status: 404 }
      );
    }

    // Get user's total score
    const { data: userSessions } = await supabase
      .from('game_sessions')
      .select('score')
      .eq('user_id', user.id)
      .not('ended_at', 'is', null);

    const userTotalScore = userSessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;

    // Get global rank (count users with higher scores)
    const { data: allUsers } = await supabase
      .from('users')
      .select('id');

    let globalRank = 1;
    if (allUsers) {
      for (const otherUser of allUsers) {
        const { data: otherSessions } = await supabase
          .from('game_sessions')
          .select('score')
          .eq('user_id', otherUser.id)
          .not('ended_at', 'is', null);

        const otherTotalScore = otherSessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;
        if (otherTotalScore > userTotalScore) {
          globalRank++;
        }
      }
    }

    // Get local rank (same store)
    const { data: storeUsers } = await supabase
      .from('users')
      .select('id')
      .eq('store_code', user.store_code);

    let localRank = 1;
    if (storeUsers) {
      for (const otherUser of storeUsers) {
        if (otherUser.id === user.id) continue;
        
        const { data: otherSessions } = await supabase
          .from('game_sessions')
          .select('score')
          .eq('user_id', otherUser.id)
          .not('ended_at', 'is', null);

        const otherTotalScore = otherSessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;
        if (otherTotalScore > userTotalScore) {
          localRank++;
        }
      }
    }

    return NextResponse.json({
      data: {
        globalRank,
        localRank,
      },
    });
  } catch (error) {
    console.error('Profile rank error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
