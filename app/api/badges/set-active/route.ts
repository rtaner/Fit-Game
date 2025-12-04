import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { badgeId } = await request.json();

    if (!badgeId) {
      return NextResponse.json(
        { error: { code: 'MISSING_BADGE_ID', message: 'Rozet ID gerekli' } },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabaseAuth = await createServerClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekli' } },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if service role key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Sunucu yapılandırma hatası' } },
        { status: 500 }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          }
        }
      }
    );

    // Verify user owns this badge (must be unlocked)
    const { data: badgeProgress, error: badgeError } = await supabase
      .from('user_badge_progress')
      .select('id, tier_unlocked, unlocked_at')
      .eq('id', badgeId)
      .eq('user_id', userId)
      .single();

    if (badgeError || !badgeProgress) {
      return NextResponse.json(
        { error: { code: 'BADGE_NOT_FOUND', message: 'Bu rozete sahip değilsiniz' } },
        { status: 404 }
      );
    }

    // Verify badge is actually unlocked
    if (!badgeProgress.tier_unlocked || !badgeProgress.unlocked_at) {
      return NextResponse.json(
        { error: { code: 'BADGE_NOT_UNLOCKED', message: 'Bu rozet henüz kazanılmamış' } },
        { status: 403 }
      );
    }

    // Set active badge
    const { error: updateError } = await supabase
      .from('users')
      .update({ active_badge_id: badgeId })
      .eq('id', userId);

    if (updateError) {
      console.error('Error setting active badge:', {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return NextResponse.json(
        { 
          error: { 
            code: 'UPDATE_ERROR', 
            message: 'Aktif rozet ayarlanamadı',
            details: updateError.message 
          } 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error in set-active badge:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
