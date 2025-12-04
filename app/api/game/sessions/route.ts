import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

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

    const supabase = createClient();

    const { data: sessions, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Oturumlar alınamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error('Error in sessions endpoint:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
