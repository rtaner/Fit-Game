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
    const authResult = await validateAdminAuth(userId);
    console.log('Auth result:', JSON.stringify(authResult));

    if (!authResult.isAuthorized) {
      console.log('ERROR: User is not authorized. Role:', authResult.role);
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: `Bu işlem için yetkiniz yok. Rol: ${authResult.role || 'bilinmiyor'}`,
          },
        },
        { status: 403 }
      );
    }

    console.log('User authorized. Role:', authResult.role, 'Store:', authResult.storeCode);

    // Get query parameters (reuse searchParams from above)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as 'employee' | 'admin' | undefined;
    let storeCode = searchParams.get('storeCode')
      ? parseInt(searchParams.get('storeCode')!)
      : undefined;

    // If store_manager, force filter to their store only
    if (authResult.role === 'store_manager' && authResult.storeCode) {
      storeCode = authResult.storeCode;
    }

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

/**
 * PATCH /api/admin/users
 * Update user role
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, currentUserId } = body;

    console.log('=== Update User Role API Debug ===');
    console.log('userId:', userId);
    console.log('role:', role);
    console.log('currentUserId:', currentUserId);

    if (!currentUserId) {
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
    const authResult = await validateAdminAuth(currentUserId);

    if (!authResult.isAuthorized) {
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

    // Store managers cannot change roles
    if (authResult.role === 'store_manager') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Mağaza yöneticileri rol değiştiremez',
          },
        },
        { status: 403 }
      );
    }

    // Validate role
    if (!['employee', 'admin', 'store_manager'].includes(role)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ROLE',
            message: 'Geçersiz rol',
          },
        },
        { status: 400 }
      );
    }

    // Update user role
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Update role error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_FAILED',
            message: 'Rol güncellenemedi',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Rol güncellenirken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}
