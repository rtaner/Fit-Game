import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '@/services/question.service';
import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  color: z.string(),
  isPrimary: z.boolean(),
});

const customOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

const createQuestionSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  question_type: z.enum(['fit', 'custom']).default('fit'),
  // Fit soruları için
  image_url: z.string().url().optional(),
  cloudinary_public_id: z.string().optional(),
  images: z.array(imageSchema).optional(),
  gender: z.enum(['Kadın', 'Erkek']).optional(),
  fit_category: z.string().optional(),
  // Özel sorular için
  custom_question_text: z.string().optional(),
  custom_options: z.array(customOptionSchema).optional(),
  // Ortak alanlar
  description: z.string().min(1),
  explanation: z.string().optional(),
  tags: z.array(z.string()),
  is_active: z.boolean().optional(),
}).refine((data) => {
  // Fit soruları için image_url zorunlu
  if (data.question_type === 'fit' && !data.image_url) {
    return false;
  }
  // Özel sorular için custom_question_text ve custom_options zorunlu
  if (data.question_type === 'custom') {
    if (!data.custom_question_text || !data.custom_options || data.custom_options.length < 2) {
      return false;
    }
    // Tam olarak 1 doğru cevap olmalı
    const correctCount = data.custom_options.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      return false;
    }
  }
  return true;
}, {
  message: 'Soru tipi için gerekli alanlar eksik veya hatalı'
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
