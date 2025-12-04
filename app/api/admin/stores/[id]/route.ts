import { NextRequest, NextResponse } from 'next/server';
import { storeService } from '@/services/store.service';
import { z } from 'zod';

const updateStoreSchema = z.object({
  store_name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = await storeService.getStoreById(id);
    
    if (!store) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Mağaza bulunamadı' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: store });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Mağaza yüklenemedi' } },
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
    const validated = updateStoreSchema.parse(body);

    // Use server-side Supabase client
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Build update object with only defined fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (validated.store_name !== undefined) {
      updateData.store_name = validated.store_name;
    }
    
    if (validated.is_active !== undefined) {
      updateData.is_active = validated.is_active;
    }
    
    const { data, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: { code: 'UPDATE_ERROR', message: 'Mağaza güncellenemedi' } },
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
    await storeService.deleteStore(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { error: { code: 'DELETE_ERROR', message: 'Mağaza silinemedi' } },
      { status: 500 }
    );
  }
}
