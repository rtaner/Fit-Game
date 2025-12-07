import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, validateAdminAuth } from '@/services/admin.service';

/**
 * PATCH /api/admin/users/[id]
 * Update user information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { first_name, last_name, username, store_code } = body;

    // Get admin ID from header
    const adminId = request.headers.get('X-User-Id');

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
    const authResult = await validateAdminAuth(adminId);

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

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Store managers can only edit users from their own store
    if (authResult.role === 'store_manager') {
      const { data: targetUser } = await supabase
        .from('users')
        .select('store_code')
        .eq('id', userId)
        .single();
      
      if (!targetUser || targetUser.store_code !== authResult.storeCode) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Sadece kendi mağazanızdaki kullanıcıları düzenleyebilirsiniz',
            },
          },
          { status: 403 }
        );
      }

      // Store managers cannot change store
      if (store_code && store_code !== authResult.storeCode) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Mağaza yöneticileri mağaza değiştiremez',
            },
          },
          { status: 403 }
        );
      }
    }

    // Check if username is already taken
    if (username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          {
            error: {
              code: 'USERNAME_TAKEN',
              message: 'Bu kullanıcı adı zaten kullanılıyor',
            },
          },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: any = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (username) updateData.username = username;
    if (store_code) updateData.store_code = store_code;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_FAILED',
            message: 'Kullanıcı güncellenemedi',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        message: 'Kullanıcı başarıyla güncellendi',
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Kullanıcı güncellenirken bir hata oluştu',
        },
      },
      { status: 500 }
    );
  }
}

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
    const authResult = await validateAdminAuth(adminId);

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

    // Store managers can only delete users from their own store
    if (authResult.role === 'store_manager') {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: targetUser } = await supabase
        .from('users')
        .select('store_code')
        .eq('id', userId)
        .single();
      
      if (!targetUser || targetUser.store_code !== authResult.storeCode) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Sadece kendi mağazanızdaki kullanıcıları silebilirsiniz',
            },
          },
          { status: 403 }
        );
      }
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
