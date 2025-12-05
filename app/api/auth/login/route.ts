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

    console.log('Login attempt for username:', validated.username);
    const result = await loginServer(validated);
    console.log('Login result:', { hasUser: !!result.user, error: result.error });

    if (result.error) {
      console.error('Login failed:', result.error);
      return NextResponse.json(
        { error: { code: 'LOGIN_ERROR', message: result.error } },
        { status: 401 }
      );
    }

    if (!result.user) {
      return NextResponse.json(
        { error: { code: 'LOGIN_ERROR', message: 'Kullanıcı bulunamadı' } },
        { status: 401 }
      );
    }

    // Set user cookie for server-side session
    const response = NextResponse.json({ 
      data: result.user.force_password_change 
        ? { ...result.user, requirePasswordChange: true }
        : result.user 
    });

    // Set cookie with user data (expires in 7 days)
    response.cookies.set('user', JSON.stringify(result.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
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
