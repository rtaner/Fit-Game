import { NextRequest, NextResponse } from 'next/server';
import {
  generateTemporaryPasswordForUser,
  validateAdminAuth,
} from '@/services/admin.service';

/**
 * POST /api/admin/users/[id]/reset-password
 * Generate temporary password for user
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

    // Generate temporary password
    const result = await generateTemporaryPasswordForUser(userId);

    return NextResponse.json({
      data: {
        temporaryPassword: result.temporaryPassword,
        username: result.username,
        message: 'Geçici şifre oluşturuldu',
      },
    });
  } catch (error: any) {
    console.error('Generate temporary password error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Geçici şifre oluşturulurken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
