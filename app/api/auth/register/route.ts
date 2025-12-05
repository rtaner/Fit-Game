import { NextRequest, NextResponse } from 'next/server';
import { registerServer } from '@/services/auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(6),
  storeCode: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const result = await registerServer(validated);

    if (result.error) {
      return NextResponse.json(
        { error: { code: 'REGISTER_ERROR', message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result.user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Kayıt sırasında bir hata oluştu' } },
      { status: 500 }
    );
  }
}
