import { NextResponse } from 'next/server';
import { categoryService } from '@/services/category.service';

export async function GET() {
  try {
    const categories = await categoryService.getActiveCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Kategoriler yüklenemedi' } },
      { status: 500 }
    );
  }
}
