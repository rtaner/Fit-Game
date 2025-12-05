import { NextRequest, NextResponse } from 'next/server';
import {
  generateResetTokenForUser,
  validateAdminAuth,
} from '@/services/admin.service';

/**
 * POST /api/admin/users/[id]/generate-token
 * Generate reset token for user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Get admin ID from query parameter
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get('userId');

    if (!adminId) {
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

    // Validate admin authorization
    const isAdmin = await validateAdminAuth(adminId);

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Bu işlem için yetkiniz yok',
          },
        },
        { status: 403 }
      );
    }

    // Generate reset token
    const result = await generateResetTokenForUser(userId);

    return NextResponse.json({
      data: {
        resetToken: result.resetToken,
        expiresAt: result.expiresAt,
        username: result.username,
        message: 'Reset kodu oluşturuldu',
      },
    });
  } catch (error: any) {
    console.error('Generate reset token error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Reset kodu oluşturulurken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
