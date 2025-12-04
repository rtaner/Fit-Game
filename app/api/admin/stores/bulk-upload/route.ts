import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { stores } = await request.json();

    if (!stores || !Array.isArray(stores) || stores.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Geçerli mağaza verisi bulunamadı' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Validate and prepare data
    const validStores = [];
    const errors = [];

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      const rowNum = i + 2; // +2 because of header row and 0-index

      // Validation
      if (!store.store_code || !store.store_name) {
        errors.push(`Satır ${rowNum}: Mağaza kodu ve adı zorunludur`);
        continue;
      }

      const storeCode = parseInt(store.store_code);
      if (isNaN(storeCode)) {
        errors.push(`Satır ${rowNum}: Geçersiz mağaza kodu`);
        continue;
      }

      validStores.push({
        store_code: storeCode,
        store_name: store.store_name.trim(),
      });
    }

    if (validStores.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Geçerli mağaza bulunamadı', details: errors } },
        { status: 400 }
      );
    }

    // Insert stores (upsert to handle duplicates)
    const { data, error } = await supabase
      .from('stores')
      .upsert(validStores, { onConflict: 'store_code' })
      .select();

    if (error) {
      console.error('Error inserting stores:', error);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Mağazalar eklenemedi', details: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        inserted: data?.length || 0,
        total: stores.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Toplu yükleme başarısız' } },
      { status: 500 }
    );
  }
}
