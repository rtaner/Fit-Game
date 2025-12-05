import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/services/auth.service';
import { validatePasswordStrength } from '@/lib/utils/password-reset';

/**
 * POST /api/auth/reset-password
 * Reset password using token (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, resetToken, newPassword } = body;

    // Validate input
    if (!username || !resetToken || !newPassword) {
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

    // Validate reset token format (6 digits)
    if (!/^\d{6}$/.test(resetToken)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Reset kodu 6 haneli olmalıdır',
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

    // Reset password
    const result = await resetPasswordWithToken({
      username,
      resetToken,
      newPassword,
    });

    if (result.error) {
      return NextResponse.json(
        {
          error: {
            code: 'RESET_FAILED',
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
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Şifre sıfırlama sırasında bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
