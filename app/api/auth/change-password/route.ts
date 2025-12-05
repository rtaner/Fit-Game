import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/services/auth.service';
import { validatePasswordStrength } from '@/lib/utils/password-reset';

/**
 * POST /api/auth/change-password
 * Change password (authenticated endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Lütfen tüm alanları doldurun',
          },
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: passwordValidation.error,
          },
        },
        { status: 400 }
      );
    }

    // Change password
    const result = await changePassword({
      userId,
      currentPassword,
      newPassword,
    });

    if (result.error) {
      return NextResponse.json(
        {
          error: {
            code: 'CHANGE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        message: 'Şifreniz başarıyla değiştirildi',
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Şifre değiştirme sırasında bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
