import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Kullanıcılar alınamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error in users endpoint:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, currentUserId } = await request.json();

    if (!userId || !role || !currentUserId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'userId, role ve currentUserId gerekli' } },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if current user is admin
    const { data: currentUser, error: authError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUserId)
      .single();

    if (authError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz yok' } },
        { status: 403 }
      );
    }

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Rol güncellenemedi' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in users update:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
