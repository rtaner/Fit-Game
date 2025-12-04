import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all badge definitions
    const { data: badges, error } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('category, display_order');

    if (error) {
      console.error('Error fetching badges:', error);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Rozetler alınamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: badges });
  } catch (error) {
    console.error('Error in GET /api/admin/badges:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: badge, error } = await supabase
      .from('badge_definitions')
      .insert({
        code: body.code,
        name: body.name,
        description: body.description,
        category: body.category,
        tier: body.tier,
        emoji: body.emoji,
        image_url: body.image_url,
        is_hidden: body.is_hidden,
        unlock_type: body.unlock_type,
        unlock_value: body.unlock_value,
        display_order: body.display_order,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating badge:', error);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Rozet oluşturulamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: badge }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/badges:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
