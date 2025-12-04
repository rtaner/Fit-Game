import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  icon_url: z.string().url().nullable().optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  is_quiz_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: category, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!category) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Kategori bulunamadı' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Kategori yüklenemedi' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('📝 Update request body:', body);
    console.log('📝 Category ID:', id);
    
    const validated = updateCategorySchema.parse(body);
    console.log('✅ Validation passed:', validated);

    const supabase = await createClient();
    
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.icon_url !== undefined) updateData.icon_url = validated.icon_url;
    if (validated.display_order !== undefined) updateData.display_order = validated.display_order;
    if (validated.is_active !== undefined) updateData.is_active = validated.is_active;
    if (validated.is_quiz_active !== undefined) updateData.is_quiz_active = validated.is_quiz_active;
    
    console.log('🔄 Updating category with data:', updateData);
    
    const { data: category, error } = await supabase
      .from('quiz_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Category updated successfully:', category);
    return NextResponse.json({ data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.issues);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('❌ Error updating category:', error);
    return NextResponse.json(
      { error: { code: 'UPDATE_ERROR', message: 'Kategori güncellenemedi' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from('quiz_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: { code: 'DELETE_ERROR', message: 'Kategori silinemedi' } },
      { status: 500 }
    );
  }
}
