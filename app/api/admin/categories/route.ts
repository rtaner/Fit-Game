import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/services/category.service';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon_url: z.string().url().optional(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Kategoriler yüklenemedi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCategorySchema.parse(body);

    const category = await categoryService.createCategory(validated);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Kategori oluşturulamadı' } },
      { status: 500 }
    );
  }
}
