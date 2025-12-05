import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Get user from headers (sent from client)
    const userId = request.headers.get('X-User-Id');
    const userRole = request.headers.get('X-User-Role') as 'admin' | 'store_manager' | 'employee' | null;
    const storeCode = request.headers.get('X-Store-Code');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Oturum bilgisi bulunamadı' } },
        { status: 401 }
      );
    }

    // Check if user has analytics access
    if (userRole !== 'admin' && userRole !== 'store_manager') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Bu sayfaya erişim yetkiniz yok' } },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // Build query
    let query = supabase
      .from('users')
      .select('id, username, first_name, last_name, store_code')
      .order('first_name', { ascending: true });

    // Store manager can only see users from their store
    if (userRole === 'store_manager' && storeCode) {
      query = query.eq('store_code', parseInt(storeCode));
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Kullanıcılar alınamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Kullanıcılar alınamadı' } },
      { status: 500 }
    );
  }
}
