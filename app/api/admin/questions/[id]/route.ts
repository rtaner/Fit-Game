import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '@/services/question.service';
import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  color: z.string(),
  isPrimary: z.boolean(),
});

const updateQuestionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  image_url: z.string().url().optional(),
  cloudinary_public_id: z.string().optional(),
  images: z.array(imageSchema).optional(),
  description: z.string().min(1).optional(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await questionService.getQuestionById(id);
    
    if (!question) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Soru bulunamadı' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Soru yüklenemedi' } },
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
    const validated = updateQuestionSchema.parse(body);

    const question = await questionService.updateQuestion(id, validated);
    return NextResponse.json({ data: question });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: { code: 'UPDATE_ERROR', message: 'Soru güncellenemedi' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Toggle active status
    if (body.action === 'toggle_active') {
      await questionService.toggleActiveStatus(id, body.isActive);
      return NextResponse.json({ data: { success: true } });
    }

    return NextResponse.json(
      { error: { code: 'INVALID_ACTION', message: 'Geçersiz işlem' } },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error patching question:', error);
    return NextResponse.json(
      { error: { code: 'PATCH_ERROR', message: 'İşlem başarısız' } },
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
    await questionService.deleteQuestion(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: { code: 'DELETE_ERROR', message: 'Soru silinemedi' } },
      { status: 500 }
    );
  }
}
