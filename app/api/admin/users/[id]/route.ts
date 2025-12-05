import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, validateAdminAuth } from '@/services/admin.service';

/**
 * DELETE /api/admin/users/[id]
 * Delete a user account
 */
export async function DELETE(
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

    // Delete user
    const result = await deleteUser(userId, adminId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'DELETE_FAILED',
            message: result.error || 'Kullanıcı silinemedi',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        message: 'Kullanıcı başarıyla silindi',
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Kullanıcı silinirken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
