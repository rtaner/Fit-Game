import { NextRequest, NextResponse } from 'next/server';
import { storeService } from '@/services/store.service';
import { z } from 'zod';

const createStoreSchema = z.object({
  store_code: z.number().int().min(1500).max(1950),
  store_name: z.string().min(1).max(100),
  is_active: z.boolean().optional(),
});

export async function GET() {
  try {
    const stores = await storeService.getAllStores();
    return NextResponse.json({ data: stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Mağazalar yüklenemedi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createStoreSchema.parse(body);

    // Check if store code already exists
    const exists = await storeService.storeCodeExists(validated.store_code);
    if (exists) {
      return NextResponse.json(
        { error: { code: 'DUPLICATE_CODE', message: 'Bu mağaza kodu zaten kullanılıyor' } },
        { status: 409 }
      );
    }

    const store = await storeService.createStore(validated);
    return NextResponse.json({ data: store }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Mağaza oluşturulamadı' } },
      { status: 500 }
    );
  }
}
