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

    // Get user from database with active badge
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, active_badge_id')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı' } },
        { status: 404 }
      );
    }

    // Get active badge details if set
    let activeBadge = null;
    if (user.active_badge_id) {
      const { data: badgeProgress } = await supabase
        .from('user_badge_progress')
        .select(`
          id,
          badge_code,
          tier_unlocked,
          unlocked_at
        `)
        .eq('id', user.active_badge_id)
        .single();

      if (badgeProgress) {
        // Get badge definition
        const { data: badgeDefinition } = await supabase
          .from('badge_definitions')
          .select('id, code, name, description, image_url, category')
          .eq('code', badgeProgress.badge_code)
          .single();

        if (badgeDefinition) {
          activeBadge = {
            id: badgeDefinition.id,
            code: badgeDefinition.code,
            name: badgeDefinition.name,
            description: badgeDefinition.description,
            image_url: badgeDefinition.image_url,
            category: badgeDefinition.category,
          };
        }
      }
    }

    // Get game statistics
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('score, total_questions, ended_at')
      .eq('user_id', user.id)
      .not('ended_at', 'is', null);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'İstatistikler yüklenemedi' } },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalGames = sessions?.length || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
    
    // Get correct answers from answer_analytics
    const { data: answers, error: answersError } = await supabase
      .from('answer_analytics')
      .select('is_correct')
      .eq('user_id', user.id);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
    }

    const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageScore = totalGames > 0 
      ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalGames 
      : 0;
    const highScore = totalGames > 0 
      ? Math.max(...sessions.map(s => s.score || 0)) 
      : 0;

    return NextResponse.json({
      data: {
        totalGames,
        totalQuestions,
        correctAnswers,
        accuracy,
        averageScore,
        highScore,
        activeBadge,
      },
    });
  } catch (error) {
    console.error('Profile stats error:', error);
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
