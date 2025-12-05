import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id } = await params;

    const { data: badge, error } = await supabase
      .from('badge_definitions')
      .update({
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
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating badge:', error);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Rozet güncellenemedi' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: badge });
  } catch (error) {
    console.error('Error in PUT /api/admin/badges/[id]:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from('badge_definitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting badge:', error);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Rozet silinemedi' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/badges/[id]:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
