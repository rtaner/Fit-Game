import { NextRequest, NextResponse } from 'next/server';
import { getUserList, validateAdminAuth } from '@/services/admin.service';

/**
 * GET /api/admin/users
 * List users with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    console.log('=== Admin Users API Debug ===');
    console.log('userId from query:', userId);

    if (!userId) {
      console.log('ERROR: No user ID in query');
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
    console.log('Validating admin auth for user:', userId);
    const isAdmin = await validateAdminAuth(userId);
    console.log('Is admin:', isAdmin);

    if (!isAdmin) {
      console.log('ERROR: User is not admin');
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

    // Get query parameters (reuse searchParams from above)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as 'employee' | 'admin' | undefined;
    const storeCode = searchParams.get('storeCode')
      ? parseInt(searchParams.get('storeCode')!)
      : undefined;

    // Get user list
    const result = await getUserList({
      page,
      limit,
      search,
      role,
      storeCode,
    });

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Kullanıcılar yüklenirken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
