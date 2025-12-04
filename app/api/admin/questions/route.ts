import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '@/services/question.service';
import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  color: z.string(),
  isPrimary: z.boolean(),
});

const createQuestionSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  image_url: z.string().url(),
  cloudinary_public_id: z.string().optional(),
  images: z.array(imageSchema).optional(),
  description: z.string().min(1),
  explanation: z.string().optional(),
  tags: z.array(z.string()),
  is_active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    let questions;

    if (search) {
      questions = await questionService.searchQuestions(search, categoryId || undefined);
    } else if (tags) {
      const tagArray = tags.split(',');
      questions = await questionService.filterByTags(tagArray, categoryId || undefined);
    } else if (categoryId) {
      questions = await questionService.getQuestionsByCategory(categoryId);
    } else {
      questions = await questionService.getAllQuestions();
    }

    return NextResponse.json({ data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Sorular yüklenemedi' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createQuestionSchema.parse(body);

    const question = await questionService.createQuestion(validated);
    return NextResponse.json({ data: question }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Soru oluşturulamadı' } },
      { status: 500 }
    );
  }
}
