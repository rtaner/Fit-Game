import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, store_code, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: users });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
