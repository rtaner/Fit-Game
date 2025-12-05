import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';
import { getCurrentUserFromSession, getStoreFilterForUser, hasAnalyticsAccess } from '@/lib/utils/session';

export async function GET(request: NextRequest) {
  try {
    // Get user from headers (sent from client)
    const userId = request.headers.get('X-User-Id');
    const userRole = request.headers.get('X-User-Role') as 'admin' | 'store_manager' | 'employee' | null;
    const storeCode = request.headers.get('X-Store-Code');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Oturum bilgisi bulunamadı' } },
        { status: 401 }
      );
    }

    // Check if user has analytics access
    if (userRole !== 'admin' && userRole !== 'store_manager') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Bu sayfaya erişim yetkiniz yok' } },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Get store filter based on user role
    const userStoreFilter = userRole === 'store_manager' ? storeCode : undefined;

    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      // Store managers can only see their own store
      storeId: userStoreFilter || searchParams.get('storeId') || undefined,
      userId: searchParams.get('userId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
    };

    const tagPerformance = await analyticsService.getTagPerformance(filters);

    return NextResponse.json({ data: tagPerformance });
  } catch (error) {
    console.error('Error fetching tag performance:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Tag performansı alınamadı' } },
      { status: 500 }
    );
  }
}
