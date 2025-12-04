import { NextRequest, NextResponse } from 'next/server';
import { loginServer } from '@/services/auth.service';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const result = await loginServer(validated);

    if (result.error) {
      return NextResponse.json(
        { error: { code: 'LOGIN_ERROR', message: result.error } },
        { status: 401 }
      );
    }

    return NextResponse.json({ data: result.user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz veri', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Giriş sırasında bir hata oluştu' } },
      { status: 500 }
    );
  }
}
